/**
 * Visa Rules Monitoring Service
 *
 * Runs weekly (configurable). For each active immigration route, it:
 *  1. Fetches every official source URL listed in the route
 *  2. Compares the SHA-256 hash of the page body against the stored hash
 *  3. If changed → asks GPT-4o to summarise what may have changed
 *  4. Creates a RequirementUpdateAlert in the DB
 *  5. Emails the admin (ADMIN_EMAIL env var)
 *
 * This is deliberately simple and targeted. It is NOT a general web crawler.
 * It only checks the specific official pages we already have on record.
 *
 * COST ESTIMATE:
 *   - 20 routes × ~3 sources each = 60 HTTP requests / week
 *   - Only calls GPT when content hash changes (rare) → near-zero AI cost
 *   - Total weekly cost ≈ USD 0.05–0.20
 *
 * HOW TO TEST MANUALLY (SSH to server):
 *   node -e "require('./dist/services/visaRulesMonitor').runVisaRulesMonitor()"
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';
import prisma from '../config/prisma';
import OpenAI from 'openai';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'admin@immigrationai.co.za';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Fetch a URL and return the SHA-256 hash of the text body.
 * Returns null if the fetch fails (network error, 4xx, 5xx, timeout).
 */
async function fetchHash(url: string): Promise<{ hash: string; body: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15 s timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ImmigrationAI-Monitor/1.0 (rule-change-detection; contact admin@immigrationai.co.za)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) {
      logger.warn(`Monitor: HTTP ${res.status} for ${url}`);
      return null;
    }

    const body = await res.text();
    // Strip HTML tags + whitespace collapse for a more stable hash
    const cleaned = body
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const hash = crypto.createHash('sha256').update(cleaned).digest('hex');
    return { hash, body: cleaned.slice(0, 8000) }; // keep first 8k chars for GPT
  } catch (err: any) {
    if (err.name === 'AbortError') {
      logger.warn(`Monitor: Timeout fetching ${url}`);
    } else {
      logger.warn(`Monitor: Fetch error for ${url}`, { error: err.message });
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Use GPT-4o-mini to summarise what may have changed between old and new content.
 * Uses mini model to keep costs low — this is a summary task, not reasoning.
 */
async function summariseChange(
  routeName: string,
  sourceUrl: string,
  pageExcerpt: string
): Promise<string> {
  if (!OPENAI_API_KEY) return `Page content changed at ${sourceUrl}. Manual review required.`;

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an immigration rules monitoring system. Briefly summarise what immigration-relevant information appears on this official page. Focus on: fees, document requirements, processing times, eligibility criteria, financial thresholds. Be concise (2–3 sentences). If nothing immigration-relevant is visible, say so.',
        },
        {
          role: 'user',
          content: `Route: ${routeName}\nSource: ${sourceUrl}\n\nPage excerpt:\n${pageExcerpt}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content?.trim() || 'Content changed — manual review required.';
  } catch (err: any) {
    logger.warn('Monitor: GPT summarise error', { error: err.message });
    return `Page content changed at ${sourceUrl}. Manual review required.`;
  }
}

/**
 * Send an alert summary email via Resend.
 */
async function sendAlertEmail(alerts: { route: string; url: string; summary: string }[]) {
  if (!process.env.RESEND_API_KEY || alerts.length === 0) return;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
      <h2 style="color:#1e293b">🔔 Visa Rules Monitor — ${alerts.length} Source Change${alerts.length > 1 ? 's' : ''} Detected</h2>
      <p style="color:#64748b">The weekly visa rules monitoring cron detected changes on official immigration pages. Please review and update the affected routes in the <a href="${process.env.FRONTEND_URL || 'https://app.immigrationai.co.za'}/admin/visa-rules">admin panel</a>.</p>
      ${alerts
        .map(
          (a) => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px">
          <p style="margin:0 0 4px;font-weight:600;color:#0f172a">${a.route}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b">${a.url}</p>
          <p style="margin:0;font-size:14px;color:#374151;background:#f8fafc;padding:8px;border-radius:4px">${a.summary}</p>
        </div>
      `
        )
        .join('')}
      <p style="color:#94a3b8;font-size:12px">This email was sent automatically by the ImmigrationAI monitoring service.</p>
    `;

    await resend.emails.send({
      from: `ImmigrationAI Monitor <${process.env.FROM_EMAIL || 'noreply@immigrationai.co.za'}>`,
      to: [ADMIN_EMAIL],
      subject: `⚠ ${alerts.length} visa source page${alerts.length > 1 ? 's' : ''} changed — review required`,
      html,
    });

    logger.info('Monitor: Alert email sent', { alertCount: alerts.length, to: ADMIN_EMAIL });
  } catch (err: any) {
    logger.error('Monitor: Failed to send alert email', { error: err.message });
  }
}

// ─── main monitor function ───────────────────────────────────────────────────

export async function runVisaRulesMonitor(): Promise<void> {
  const startTime = Date.now();
  logger.info('Monitor: Starting visa rules check...');

  let checkedSources = 0;
  let changesDetected = 0;
  const emailAlerts: { route: string; url: string; summary: string }[] = [];

  try {
    // Load all active routes with their official sources
    const routes = await prisma.visaRequirement.findMany({
      where: { isActive: true },
      select: {
        id: true,
        routeKey: true,
        displayName: true,
        officialSources: true,
      },
    });

    logger.info(`Monitor: Checking ${routes.length} active routes`);

    for (const route of routes) {
      const sources = Array.isArray(route.officialSources) ? route.officialSources : [];

      for (const source of sources as { name: string; url: string; lastChecked: string; contentHash: string }[]) {
        if (!source.url) continue;

        checkedSources++;

        // Rate limit: small delay between requests to avoid hammering servers
        await new Promise((r) => setTimeout(r, 500));

        const fetched = await fetchHash(source.url);
        if (!fetched) continue; // Skip if fetch failed — don't false-alarm

        const prevHash = source.contentHash || '';

        if (prevHash === '') {
          // First time checking this source — just record the hash, no alert
          await prisma.visaRequirement.update({
            where: { id: route.id },
            data: {
              officialSources: (route.officialSources as any[]).map((s: any) =>
                s.url === source.url
                  ? { ...s, contentHash: fetched.hash, lastChecked: new Date().toISOString() }
                  : s
              ),
            },
          });
          logger.info(`Monitor: Baseline hash recorded for ${source.url}`);
          continue;
        }

        if (fetched.hash !== prevHash) {
          changesDetected++;
          logger.warn(`Monitor: CHANGE DETECTED — ${route.displayName} — ${source.url}`);

          // Ask GPT to summarise the content (cost-efficient mini model)
          const summary = await summariseChange(route.displayName, source.url, fetched.body);

          // Determine severity based on keywords
          const severity = /fee|threshold|financial|requirement|mandatory|required|refused|refused|refused/i.test(summary)
            ? 'high'
            : 'informational';

          // Create alert in DB
          await prisma.requirementUpdateAlert.create({
            data: {
              requirementId: route.id,
              routeKey: route.routeKey,
              sourceUrl: source.url,
              alertType: 'page_changed',
              severity,
              description: summary,
              oldContentHash: prevHash,
              newContentHash: fetched.hash,
            },
          });

          // Update the stored hash
          await prisma.visaRequirement.update({
            where: { id: route.id },
            data: {
              officialSources: (route.officialSources as any[]).map((s: any) =>
                s.url === source.url
                  ? { ...s, contentHash: fetched.hash, lastChecked: new Date().toISOString() }
                  : s
              ),
            },
          });

          emailAlerts.push({ route: route.displayName, url: source.url, summary });
        } else {
          // Hash matches — update lastChecked timestamp only
          await prisma.visaRequirement.update({
            where: { id: route.id },
            data: {
              officialSources: (route.officialSources as any[]).map((s: any) =>
                s.url === source.url
                  ? { ...s, lastChecked: new Date().toISOString() }
                  : s
              ),
            },
          });
        }
      }
    }

    // Send a single consolidated email if anything changed
    if (emailAlerts.length > 0) {
      await sendAlertEmail(emailAlerts);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info(
      `Monitor: Completed in ${duration}s — ${checkedSources} sources checked, ${changesDetected} changes detected`
    );
  } catch (err: any) {
    logger.error('Monitor: Unexpected error during visa rules check', { error: err.message });
  }
}
