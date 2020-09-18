// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import { getStoredToken, checkTokenValidity } from '../utils';
import {
	ServiceAPI,
	UpdateApp,
	CDSRequest,
	CDSAddRequestData,
	CDSUpdateRequestData,
	CDSUpdateAddRequestData,
} from '../../models';

/**
 * Invokes write back service
 * @param reqObject Request object containing service API, request method and request body
 * @param updateApp Callback method to re-render App component if session is expired
 * @param setError Shows the server returned error
 */
export async function saveCDSData(
	reqObject: CDSRequest,
	updateApp: UpdateApp,
	setError: { (error: string): void }
): Promise<boolean> {
	const jwtToken = getStoredToken();
	if (!checkTokenValidity(jwtToken)) {
		alert('Session expired');

		// Re-render App component
		updateApp((prev: number) => prev + 1);
		return false;
	}
	try {
		const serverRes = await fetch(reqObject.cdsServiceApi, {
			method: reqObject.method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwtToken}`,
			},
			body: reqObject.body,
		});

		if (!serverRes.ok) {
			// Show error popup if request fails
			setError(await serverRes.text());
			console.error(
				`Failed to perform write back operation. Status: ${serverRes.status} ${serverRes.statusText}`
			);
			return false;
		}
	} catch (error) {
		console.error(`Error while performing write back operation: ${error}`);
		return false;
	}
	return true;
}

export class CDSAddRequest implements CDSRequest {
	cdsServiceApi: string;
	method: string;
	body: string;
	constructor(cdsAddRequestData: CDSAddRequestData) {
		this.cdsServiceApi = ServiceAPI.WriteBackAdd;
		this.method = 'POST';
		this.body = JSON.stringify(cdsAddRequestData);
	}
}

export class CDSUpdateRequest implements CDSRequest {
	cdsServiceApi: string;
	method: string;
	body: string;
	constructor(cdsUpdateRequestData: CDSUpdateRequestData) {
		this.cdsServiceApi = ServiceAPI.WriteBackUpdate;
		this.method = 'PUT';
		this.body = JSON.stringify(cdsUpdateRequestData);
	}
}

export class CDSUpdateAddRequest implements CDSRequest {
	cdsServiceApi: string;
	method: string;
	body: string;
	constructor(cdsUpdateAddRequestData: CDSUpdateAddRequestData) {
		this.cdsServiceApi = ServiceAPI.WriteBackUpdateAdd;
		this.method = 'POST';
		this.body = JSON.stringify(cdsUpdateAddRequestData);
	}
}
