// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import { getStoredToken, checkTokenValidity } from '../utils';
import {
	ServiceAPI,
	UpdateApp,
	DataverseRequest,
	DataverseAddRequestData,
	DataverseUpdateRequestData,
	DataverseUpdateAddRequestData,
} from '../../models';

/**
 * Invokes write back service
 * @param reqObject Request object containing service API, request method and request body
 * @param updateApp Callback method to re-render App component if session is expired
 * @param setError Shows the server returned error
 */
export async function saveDataverseData(
	reqObject: DataverseRequest,
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
		const serverRes = await fetch(reqObject.dataverseServiceApi, {
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

export class DataverseAddRequest implements DataverseRequest {
	dataverseServiceApi: string;
	method: string;
	body: string;
	constructor(dataverseAddRequestData: DataverseAddRequestData) {
		this.dataverseServiceApi = ServiceAPI.WriteBackAdd;
		this.method = 'POST';
		this.body = JSON.stringify(dataverseAddRequestData);
	}
}

export class DataverseUpdateRequest implements DataverseRequest {
	dataverseServiceApi: string;
	method: string;
	body: string;
	constructor(dataverseUpdateRequestData: DataverseUpdateRequestData) {
		this.dataverseServiceApi = ServiceAPI.WriteBackUpdate;
		this.method = 'PUT';
		this.body = JSON.stringify(dataverseUpdateRequestData);
	}
}

export class DataverseUpdateAddRequest implements DataverseRequest {
	dataverseServiceApi: string;
	method: string;
	body: string;
	constructor(dataverseUpdateAddRequestData: DataverseUpdateAddRequestData) {
		this.dataverseServiceApi = ServiceAPI.WriteBackUpdateAdd;
		this.method = 'POST';
		this.body = JSON.stringify(dataverseUpdateAddRequestData);
	}
}
