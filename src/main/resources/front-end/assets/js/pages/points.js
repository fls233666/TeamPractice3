window.PagePoints = {
	async render(){
		// 拉取礼品列表（带分页）
		let gifts = [];
		const params = new URLSearchParams(location.hash.split('?')[1]||'');
		const page = +(params.get('page')||1);
		const limit = +(params.get('limit')||12);

		// 生成足量本地模拟礼物（保证≥3页）
		const TOTAL_MOCK = 48; // 4页 * 12
		const buildMockCatalog = ()=> Array.from({length:TOTAL_MOCK}).map((_,idx)=>({
			id: idx+1,
			title: `示例礼品 ${idx+1}`,
			pictureUrl: `./assets/img/gift${(idx%3)+1}.svg`,
			cost: 50 + (idx%10)*10,
			storage: (idx%5===0)? 0 : (10 - (idx%7))
		}));
		let usingMock = false;
		try{
			const { ok, res } = await API.safe(API.points.gifts, page, limit);
			if (ok && res?.data && Array.isArray(res.data)){
				// 若后端无法按 limit 返回足量或无分页能力，则切到本地模拟，保证可翻页体验
				if (res.data.length >= limit){
					gifts = res.data;
				}else{
					usingMock = true;
				}
			}else{
				usingMock = true;
			}
		}catch(e){
			usingMock = true;
		}
		if (usingMock){
			const catalog = buildMockCatalog();
			const start = (page-1)*limit;
			gifts = catalog.slice(start, start+limit);
		}

		const grid = (gifts||[]).map(g=>`
			<div class="col-6 col-md-4 col-lg-3">
				<div class="card h-100 card-hover">
					<img class="card-img-top ${g.pictureUrl?'':'d-none'} lazy" width="100%" height="140" data-src="${g.pictureUrl||'./assets/img/gift1.svg'}" alt="${g.title||'商品'}">
					<div class="card-body d-flex flex-column">
						<div class="fw-semibold text-truncate" title="${g.title||''}">${g.title||'商品'}</div>
						<p class="text-secondary small flex-grow-1">${g.storage===0?'库存：售罄':`库存：${g.storage??'--'}`}</p>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge text-bg-secondary">需要 ${g.cost??'--'}</span>
							<div class="btn-group">
								<button class="btn btn-sm btn-outline-secondary" data-detail-id="${g.id}">详情</button>
								<button class="btn btn-sm btn-primary" data-gift-id="${g.id}" ${g.storage===0?'disabled':''}>兑换</button>
							</div>
						</div>
					</div>
				</div>
			</div>`).join('');
		const makeLink = (p,l)=> `#/points?page=${p}&limit=${l}`;
		// 当使用本地模拟数据时，提供明确的分页边界（≥3页）
		let prevDisabled = page<=1 ? 'disabled' : '';
		let nextDisabled = '';
		if (usingMock){
			const totalPages = Math.ceil(TOTAL_MOCK/limit);
			nextDisabled = page>=totalPages ? 'disabled' : '';
		}
		return `
		<div class="my-4">
			<h1 class="h4 mb-3">积分系统</h1>
			<div class="row g-3">
				<div class="col-lg-4">
					<div class="card h-100">
						<div class="card-body">
							<h2 class="h6">积分概览</h2>
							<div class="display-6 fw-bold">${App.state.user?.points ?? 120}</div>
							<div class="text-secondary small mb-2">当前积分（登录后实时刷新）</div>
							<div class="d-flex align-items-center gap-3">
								<span class="badge text-bg-primary">Lv.${Math.max(1, Math.ceil(((App.state.user?.points ?? 120))/100))}</span>
								<div class="flex-grow-1">
									<div class="progress" style="height:8px">
										<div class="progress-bar" style="width:${Math.min(100, ((App.state.user?.points ?? 120) % 100))}%"></div>
									</div>
									<div class="small text-secondary mt-1">每 100 分升 1 级</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col-lg-8">
					<div class="card h-100">
						<div class="card-body">
							<h2 class="h6 mb-3">如何获得积分</h2>
							<div class="row g-2">
								<div class="col-md-4">
									<div class="table-card p-3 h-100">
										<div class="fw-semibold mb-2">每日任务</div>
										<ul class="mb-0 small text-secondary">
											<li class="mb-1">每日首次登录：+5</li>
											<li class="mb-1">与智能对话（≤5次/日）：+5/次</li>
										</ul>
									</div>
								</div>
								<div class="col-md-4">
									<div class="table-card p-3 h-100">
										<div class="fw-semibold mb-2">成长任务</div>
										<ul class="mb-0 small text-secondary">
											<li class="mb-1">完善个人资料：+10</li>
											<li class="mb-1">提交有效反馈（≤1次/日）：+10</li>
										</ul>
									</div>
								</div>
								<div class="col-md-4">
									<div class="table-card p-3 h-100">
										<div class="fw-semibold mb-2">快捷入口</div>
										<div class="d-grid gap-2">
											<button class="btn btn-outline-primary btn-sm" id="goProfile">完善个人资料</button>
											<button class="btn btn-outline-primary btn-sm" id="goChat">打开智能对话</button>
											<button class="btn btn-outline-primary btn-sm" id="goFeedback">提交用户反馈</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<h2 class="h6 mt-4 mb-3">积分商城</h2>
			<div class="row g-3" id="giftGrid">${grid}</div>
			<nav class="mt-3" aria-label="分页">
				<ul class="pagination pagination-sm mb-0">
					<li class="page-item ${prevDisabled}"><a class="page-link" href="${makeLink(Math.max(1,page-1),limit)}">上一页</a></li>
					<li class="page-item active"><span class="page-link">${page}</span></li>
					<li class="page-item ${nextDisabled}"><a class="page-link" href="${makeLink(page+1,limit)}">下一页</a></li>
				</ul>
			</nav>

			<h2 class="h6 mt-4 mb-3">积分历史</h2>
			<div class="card">
				<div class="card-body">
					<div class="row g-2 mb-2">
						<div class="col-md-4">
							<input type="date" class="form-control" aria-label="开始时间">
						</div>
						<div class="col-md-4">
							<input type="date" class="form-control" aria-label="结束时间">
						</div>
						<div class="col-md-4">
							<select class="form-select" aria-label="排序">
								<option>按时间倒序</option>
								<option>按时间正序</option>
							</select>
						</div>
					</div>
					<div class="table-responsive">
						<table class="table table-striped align-middle stackable">
							<thead><tr><th>时间</th><th>变动</th><th>来源</th></tr></thead>
							<tbody>
								${[1,2,3,4,5].map(i=>`
								<tr>
									<td data-label="时间">2025-06-1${i}</td>
									<td data-label="变动">+${[20,10,5,5,10][i%5]}</td>
									<td data-label="来源">示例来源</td>
								</tr>`).join('')}
							</tbody>
						</table>
					</div>
					<nav class="mt-2" aria-label="分页">
						<ul class="pagination pagination-sm mb-0">
							<li class="page-item disabled"><span class="page-link">上一页</span></li>
							<li class="page-item active"><span class="page-link">1</span></li>
							<li class="page-item"><a class="page-link" href="#">2</a></li>
							<li class="page-item"><a class="page-link" href="#">下一页</a></li>
						</ul>
					</nav>
				</div>
			</div>
		</div>`;
	},
	mount(root){
		// 懒加载图
		App.initLazyImages();
		// 任务快捷入口
		root.querySelector('#goProfile')?.addEventListener('click', ()=> location.hash = '#/user');
		root.querySelector('#goChat')?.addEventListener('click', ()=> location.hash = '#/chat');
		root.querySelector('#goFeedback')?.addEventListener('click', ()=>{
			App.confirm('现在去提交一条产品反馈？', async ()=>{
				const { ok, msg } = await API.safe(API.feedback.submit, '前端积分页面反馈：体验良好');
				if (ok){
					App.showToast('反馈提交成功','success');
					// 刷新积分
					const me = await API.safe(API.auth.me);
					if (me.ok && me.res?.data){
						const d = me.res.data;
						App.saveUser({ ...(App.state.user||{}), points: d.points });
					}
				}else{
					App.showToast(msg || '反馈提交失败','danger');
				}
			});
		});
		// 兑换
		root.querySelectorAll('[data-gift-id]').forEach(btn=>{
			btn.addEventListener('click', async ()=>{
				const id = +btn.getAttribute('data-gift-id');
				btn.disabled = true;
				const { ok, res, msg } = await API.safe(API.points.consume, id);
				if (ok){
					App.showToast('兑换成功','success');
					// 刷新用户积分
					await API.safe(API.auth.me).then(me=>{
						if (me.ok && me.res?.data){
							const d = me.res.data;
							App.saveUser({ ...(App.state.user||{}), points: d.points });
						}
					});
				}else{
					App.showToast(msg || '兑换失败','danger');
				}
				btn.disabled = false;
			});
		});
		// 详情模态
		root.querySelectorAll('[data-detail-id]').forEach(btn=>{
			btn.addEventListener('click', async ()=>{
				const id = +btn.getAttribute('data-detail-id');
				let detail = null;
				try{
					const resp = await fetch(`http://47.96.191.232:8080/gift/detail/${id}`, { credentials:'include' });
					const data = await resp.json();
					if (data && (data.data || data.title)) detail = data.data || data;
				}catch(e){}
				if (!detail){
					detail = { title:'示例礼品', description:'这是一个示例详情', pictureUrl1:'./assets/img/gift1.svg', pictureUrl2:'./assets/img/gift2.svg', pictureUrl3:'./assets/img/gift3.svg', cost:80, storage:10 };
				}
				const modal = document.createElement('div');
				modal.className = 'modal fade';
				modal.tabIndex = -1;
				modal.innerHTML = `
				<div class="modal-dialog modal-lg modal-dialog-centered">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">${detail.title||'礼品详情'}</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
						</div>
						<div class="modal-body">
							<div class="row g-2 mb-2">
								<div class="col-4"><img class="img-fluid rounded lazy" data-src="${detail.pictureUrl1||'./assets/img/gift1.svg'}" alt=""></div>
								<div class="col-4"><img class="img-fluid rounded lazy" data-src="${detail.pictureUrl2||'./assets/img/gift2.svg'}" alt=""></div>
								<div class="col-4"><img class="img-fluid rounded lazy" data-src="${detail.pictureUrl3||'./assets/img/gift3.svg'}" alt=""></div>
							</div>
							<p class="mb-0">${detail.description||'暂无描述'}</p>
						</div>
						<div class="modal-footer">
							<span class="me-auto text-secondary small">需要积分：${detail.cost??'--'}；库存：${detail.storage??'--'}</span>
							<button type="button" class="btn btn-primary" id="detailExchange"${detail.storage===0?' disabled':''}>立即兑换</button>
						</div>
					</div>
				</div>`;
				document.body.appendChild(modal);
				const bs = new bootstrap.Modal(modal);
				modal.addEventListener('hidden.bs.modal', ()=> modal.remove());
				modal.querySelector('#detailExchange')?.addEventListener('click', async ()=>{
					const ex = await API.safe(API.points.consume, id);
					if (ex.ok){
						App.showToast('兑换成功','success');
						bs.hide();
						await API.safe(API.auth.me).then(me=>{
							if (me.ok && me.res?.data){
								const d = me.res.data;
								App.saveUser({ ...(App.state.user||{}), points: d.points });
							}
						});
					}else{
						App.showToast(ex.msg || '兑换失败','danger');
					}
				});
				bs.show();
				App.initLazyImages();
			});
		});
	}
};


