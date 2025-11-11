// 简易 API 客户端，基于 default.md 文档
(function (global) {
    // 允许通过 window.API_BASE 或 localStorage.API_BASE 覆盖后端地址
    const DEFAULT_BASE = 'http://47.96.191.232:80/api';
    const BASE = (global.API_BASE || localStorage.getItem('API_BASE') || DEFAULT_BASE).replace(/\/+$/, '');
    // 始终携带 Cookie，确保会话能建立（需要后端允许 CORS 且 Allow-Credentials=true）
    const USE_CREDENTIALS = true;

    // 固定 Authorization 令牌（按需修改）
    const FIXED_AUTHORIZATION = ''

    // 统一持久化 token（localStorage + cookie）
    function persistToken(token) {
        if (!token) return;
        try {
            localStorage.setItem('API_TOKEN', token);
            // 简单设为 Lax，若需要跨站可改为 None; Secure（需 HTTPS）
            document.cookie = `API_TOKEN=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
        } catch (e) {
        }
    }

    function getAuthHeaders() {
        // 动态从本地读取 token（推荐）
        try {
            const t = localStorage.getItem('API_TOKEN');
            if (t) return {'authorization': t};
        } catch (e) {
        }
        return {};
    }

    async function request(url, {method = 'GET', data, headers} = {}) {
        const opts = {
            method: method, headers: {
                'Accept': '*/*', ...(data ? {'Content-Type': 'application/json'} : {}), ...getAuthHeaders(), ...headers
            }, body: data ? JSON.stringify(data) : undefined, /*credentials: USE_CREDENTIALS ? 'include' : 'omit',
            mode: 'cors'*/
        };
        let res;
        try {
            res = await fetch(url, opts);
        } catch (err) {
            console.error('API error:', err);
            throw new Error('网络请求失败，可能是跨域或网络不可达（请使用本地服务器打开前端，或在后端开启 CORS 并允许来源）');
        }
        // 尝试从响应头捕获并保存 Token（如果后端提供）
        try {
            const hAuth = res.headers.get('authorization') || res.headers.get('Authorization') || res.headers.get('x-auth-token') || res.headers.get('X-Auth-Token');
            if (hAuth) persistToken(hAuth);
        } catch (e) {
        }
        const contentType = res.headers.get('content-type') || '';
        let payload = null;
        try {
            payload = contentType.includes('application/json') ? await res.json() : await res.text();
        } catch (e) {
            // ignore
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}` + payload);
        }
        // 默认返回结构 { code, data, msg }
        if (payload && typeof payload === 'object' && ('code' in payload || 'data' in payload || 'msg' in payload)) {
            // 如果 body 中返回 token，也记录
            try {
                const maybeToken = payload?.data?.token || payload?.token;
                if (maybeToken) persistToken(maybeToken);
            } catch (e) {
            }
            // 某些文档示例 code=0 但 msg=异常，这里做宽松判断：有 data 则认为成功
            if (payload.data !== undefined) return payload;
            // 无 data 则也返回原始，交由上层判断
            return payload;
        }
        return payload;
    }

    function num2Str(dataNum) {
        return dataNum < 10 ? `0${dataNum}` : `${dataNum}`;
    }

    /**
     * @param {Date} date
     */
    function dateToPathVariable(date) {
        let fullYear = date.getFullYear();
        let month = num2Str(date.getMonth() + 1); // month 从0开始
        let day = num2Str(date.getDate());
        let hours = num2Str(date.getHours());
        let minutes = num2Str(date.getMinutes());
        let seconds = num2Str(date.getSeconds());
        let s = `${fullYear}-${month}-${day}_${hours}:${month}:${seconds}`;
        console.log(s)
        return s
    }

    const Api = {
        auth: {
            login: (loginForm) => request(`${BASE}/user/login`, {method: 'POST', data: loginForm}),
            logout: () => request(`${BASE}/user/logout`, {method: 'POST'}),
            register: (registerForm) => request(`${BASE}/user/register`, {method: 'POST', data: registerForm}),
            me: () => request(`${BASE}/user/me`),
            update: (userDto) => request(`${BASE}/user/update`, {method: 'PUT', data: userDto}),
            getById: (id) => request(`${BASE}/user/${id}`)
        }, robot: {
            chat: (model = 'deepseek', message) => {
                const path = model === 'qwen' ? '/robot/chat/qwen' : '/robot/chat/deepseek';
                const payload = typeof message === 'string' ? {message} : (message || {});
                return request(`${BASE}${path}`, {method: 'POST', data: payload});
            }, historyMe: ({limit, page, timeFrom, timeTo} = {}) => {
                const q = [];
                if (limit != null) q.push(`${limit}`);
                if (page != null) q.push(`${page}`);
                if (timeFrom) q.push(`${dateToPathVariable(timeFrom)}`);
                if (timeTo) q.push(`${dateToPathVariable(timeTo)}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${BASE}/robot/history/me${qs}`);
            }, pieces: ({chatId, limit}) => {
                // 文档为 DELETE /robot/pieces/{chat-id}[/{limit}]
                const path = typeof limit === 'number' ? `${chatId}/${limit}` : `${chatId}`;
                return request(`${BASE}/robot/pieces/${path}`, {method: 'DELETE'});
            }
        }, points: {
            // 文档为 path 传参，这里优先 query 以兼容实现
            gifts: (page = 1, limit = 12) => request(`${BASE}/gift/all/${limit}/${page}`),
            giftsInRange: ({lower = 0, upper = null, page = 1, limit = 12}) => {
                const up = upper == null ? '' : `&upper=${upper}`;
                return request(`${BASE}/gift/cost-in-range/${lower}/${up}/${limit}/${page}`);
            },
            consume: (id) => request(`${BASE}/gift/consume/`, {method: 'PUT', data: {id}}),
            detail: (id) => request(`${BASE}/gift/detail/${id}`)
        }, feedback: {
            submit: (text) => request(`${BASE}/feedback/feedback`, {method: 'POST', data: {text}})
        }, consult: {
            getMine: () => request(`${BASE}/consultation-content/me`),
            update: (dto) => request(`${BASE}/consultation-content/update`, {method: 'PUT', data: dto})
        }, admin: {
            users: (page = 1, limit = 10) => request(`${BASE}/admin/user/all/${limit}/${page}`),
            userOne: (id) => request(`${BASE}/admin/user/one/${id}`),
            userUpdate: (info) => request(`${BASE}/admin/user/update`, {method: 'PUT', data: info}),
            consultAll: (page = 1, limit = 10) => request(`${BASE}/admin/consultation/all/${limit}/${page}`),
            consultCombineAll: (page = 1, limit = 10) => request(`${BASE}/admin/consultation/combine/all/${limit}/${page}`),
            consultCombineById: (id) => request(`${BASE}/admin/consultation/combine/${id}`),
            consultByUserId: (userId) => request(`${BASE}/admin/consultation/user/${userId}`),
            hotWords: (limit = 10) => request(`${BASE}/admin/consultation/hot-word/${limit}`),
            feedbackNotRead: ({limit, page, timeFrom, timeTo} = {}) => {
                const q = [];
                if (!timeFrom) timeFrom = new Date(0)
                q.push(`${dateToPathVariable(timeFrom)}`);
                if (!timeTo) timeTo = new Date()
                q.push(`${dateToPathVariable(timeTo)}`);
                if (limit == null) limit = 20;
                q.push(`${limit}`);
                if (page == null) page = 1;
                q.push(`${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${BASE}/admin/feedback/not-read${qs}`);
            },
            feedbackReadList: ({limit, page, timeFrom, timeTo} = {}) => {
                const q = [];
                if (timeFrom) q.push(`${dateToPathVariable(timeFrom)}`);
                if (timeTo) q.push(`${dateToPathVariable(timeTo)}`);
                if (limit != null) q.push(`${limit}`);
                if (page != null) q.push(`${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${BASE}/admin/feedback/read${qs}`);
            },
            feedbackMarkRead: (id) => request(`${BASE}/admin/feedback/read`, {method: 'PUT', data: id}),
            feedbackByUser: ({userId, read = false, limit, page}) => {
                if (read !== true) read = false;
                const base = `${BASE}/admin/feedback/user/${userId}/${read}`;
                const q = [];
                if (limit != null) q.push(`limit=${limit}`);
                if (page != null) q.push(`page=${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${base}${qs}`);
            },
            robotHistoryUser: ({userId, timeFrom, timeTo, limit, page}) => {
                const q = [];
                if (timeFrom) q.push(`${dateToPathVariable(timeFrom)}`);
                if (timeTo) q.push(`${dateToPathVariable(timeTo)}`);
                if (limit != null) q.push(`${limit}`);
                if (page != null) q.push(`${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${BASE}/admin/robot/history/${userId}${qs}`);
            },
            actionCostLongerThan: ({ms, limit, page}) => {
                const q = [];
                if (limit != null) q.push(`${limit}`);
                if (page != null) q.push(`${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                let url = `${BASE}/admin/action/cost/${ms}${qs}`;
                return request(url);
            },
            actionRequestTimeLatest: ({timeFrom, timeTo, limit, page} = {}) => {
                const q = [];
                if (timeFrom) q.push(`${dateToPathVariable(timeFrom)}`);
                if (timeTo) q.push(`${dateToPathVariable(timeTo)}`);
                if (limit != null) q.push(`${limit}`);
                if (page != null) q.push(`${page}`);
                const qs = q.length ? `/${q.join('/')}` : '';
                return request(`${BASE}/admin/action/request-time-latest${qs}`);
            },
            giftInsert: (giftInfo) => request(`${BASE}/admin/gift/insert`, {method: 'POST', data: giftInfo}),
            giftUpdate: (giftInfo) => request(`${BASE}/admin/gift/update`, {method: 'PUT', data: giftInfo}),
            giftDelete: (id) => request(`${BASE}/admin/gift/delete/${id}`, {method: 'DELETE'})
        }, // 基础能力暴露
        get BASE() {
            return BASE;
        }, setBase(next) {
            if (typeof next === 'string' && next) {
                localStorage.setItem('API_BASE', next);
                location.reload();
            }
        }, get token() {
            return localStorage.getItem('API_TOKEN') || '';
        }, setToken(tok) {
            if (tok) persistToken(tok); else {
                localStorage.removeItem('API_TOKEN');
                document.cookie = 'API_TOKEN=; Max-Age=0; path=/';
            }
        }, clearToken() {
            localStorage.removeItem('API_TOKEN');
        }, pingEcho(message = 'ping') {
            return request(`${BASE}/hello/echo/${message}`);
        }
    };

    // 简单的容错封装：失败时返回 null 并记录 msg
    Api.safe = async (fn, ...args) => {
        try {
            const res = await fn(...args);
            return {ok: true, res};
        } catch (e) {
            console.error('API error:', e);
            return {ok: false, msg: e.message || '请求失败'};
        }
    };

    global.API = Api;
})(window);


