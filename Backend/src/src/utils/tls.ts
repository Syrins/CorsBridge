import https from 'https';
import { Agent as UndiciAgent, setGlobalDispatcher } from 'undici';

import { logger } from '../services/logger.service';

let configured = false;

export function disableTlsSessionReuse(): void {
	if (configured) {
		return;
	}

	const agent = https.globalAgent as https.Agent & { maxCachedSessions?: number };
	if (agent.options) {
		agent.options.maxCachedSessions = 0;
	}
	if (typeof agent.maxCachedSessions === 'number') {
		agent.maxCachedSessions = 0;
	}

	try {
		const dispatcher = new UndiciAgent({
			connect: {
				maxCachedSessions: 0,
			},
			pipelining: 0,
		});
		setGlobalDispatcher(dispatcher);
		logger.info('Undici TLS session cache disabled');
	} catch (error) {
		logger.warn({ error }, 'Failed to disable undici TLS session cache');
	}

	configured = true;
}
