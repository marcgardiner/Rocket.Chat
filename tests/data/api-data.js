import { publicChannelName, privateChannelName } from '../data/channel.js';
import { roleNameUsers, roleNameSubscriptions, roleScopeUsers, roleScopeSubscriptions, roleDescription } from '../data/role.js';
import { username, email, adminUsername, adminPassword } from '../data/user.js';
import supertest from 'supertest';
export const request = supertest('http://localhost:3000');
const prefix = '/api/v1/';

export const apiUsername = `api${ username }`;
export const apiEmail = `api${ email }`;
export const apiPublicChannelName = `api${ publicChannelName }`;
export const apiPrivateChannelName = `api${ privateChannelName }`;

export const apiRoleNameUsers = `api${ roleNameUsers }`;
export const apiRoleNameSubscriptions = `api${ roleNameSubscriptions }`;
export const apiRoleScopeUsers = `${ roleScopeUsers }`;
export const apiRoleScopeSubscriptions = `${ roleScopeSubscriptions }`;
export const apiRoleDescription = `api${ roleDescription }`;

export const targetUser = {};
export const channel = {};
export const group = {};
export const message = {};
export const directMessage = {};
export const integration = {};
export const credentials = {
	['X-Auth-Token']: undefined,
	['X-User-Id']: undefined,
};
export const login = {
	user: adminUsername,
	password: adminPassword,
};

export function api(path) {
	return prefix + path;
}

export function log(res) {
	console.log(res.req.path);
	console.log({
		body: res.body,
		headers: res.headers,
	});
}

export function getCredentials(done = function() {}) {
	request.post(api('login'))
		.send(login)
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			credentials['X-Auth-Token'] = res.body.data.authToken;
			credentials['X-User-Id'] = res.body.data.userId;
		})
		.end(done);
}

const methods = ['get', 'post', 'delete', 'put'];
let lastRequest;

methods.forEach((method) => {
	const original = request[method];
	request[method] = function(...args) {
		const result = original(...args);
		result.expect((res) => {
			lastRequest = res;
			return true;
		});
		return result;
	};
});

const oit = it;
it = function(description, fn) {
	lastRequest = undefined;
	return oit(description, fn);
};

afterEach(function() {
	if (this.currentTest.state === 'failed' && lastRequest) {
		console.log(lastRequest.body);
	}
});
