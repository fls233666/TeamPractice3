window.PageHome = {
	async render(){
		return `
		<section class="hero mb-4">
			<div class="row align-items-center">
				<div class="col-lg-7">
					<h1 class="display-5 fw-bold">智能购车顾问</h1>
					<p class="lead">基于多维偏好与预算分析，为你匹配更合适的车型建议与行动方案。</p>
					<div class="d-flex gap-2 mt-3">
						<a href="#/chat" class="btn btn-light btn-lg">立即咨询</a>
						<button type="button" class="btn btn-outline-light btn-lg" id="btnLearn">了解功能</button>
					</div>
				</div>
				<div class="col-lg-5 d-none d-lg-block">
					<img class="img-fluid rounded-4 shadow lazy" data-src="./assets/img/hero-car.svg" alt="智能购车" width="560" height="360">
				</div>
			</div>
		</section>

		<section id="features" class="mb-5">
			<h2 class="h4 mb-3">功能特色</h2>
			<div class="row g-3">
				${[
					{t:'精准匹配',d:'结合预算与场景，匹配推荐更贴近需求',i:'🔎'},
					{t:'多维对比',d:'参数、优缺点、口碑多维度横向对比',i:'⚖️'},
					{t:'数据可视',d:'预算与花费构成可视化呈现',i:'📊'},
					{t:'流程指引',d:'三步完成咨询与确认，简单高效',i:'✅'}
				].map(x=>`
				<div class="col-12 col-sm-6 col-lg-3">
					<div class="card h-100 card-hover">
						<div class="card-body">
							<div class="fs-3 mb-2">${x.i}</div>
							<h3 class="h6">${x.t}</h3>
							<p class="text-secondary small mb-0">${x.d}</p>
						</div>
					</div>
				</div>`).join('')}
			</div>
		</section>

		<section class="mb-5">
			<h2 class="h4 mb-3">使用步骤</h2>
			<div class="timeline">
				<div class="item">
					<div class="card border-0">
						<div class="card-body">
							<strong>步骤一：</strong> 填写预算、使用场景与燃料偏好
						</div>
					</div>
				</div>
				<div class="item">
					<div class="card border-0">
						<div class="card-body">
							<strong>步骤二：</strong> 选择品牌与车型类别，补充特殊需求
						</div>
					</div>
				</div>
				<div class="item">
					<div class="card border-0">
						<div class="card-body">
							<strong>步骤三：</strong> 确认信息，查看结果与行动建议
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="mb-5">
			<h2 class="h4 mb-3">用户评价</h2>
			<div id="carouselTestimonials" class="carousel slide" data-bs-ride="carousel" aria-label="用户评价轮播">
				<div class="carousel-inner">
					${[
						{n:'陈*生',c:'匹配的车型非常贴合我的日常通勤需求，省心！'},
						{n:'李*敏',c:'预算分析图很直观，帮助我快速做了决策。'},
						{n:'王*杰',c:'多维对比一目了然，省去了大量信息收集时间。'}
					].map((x,i)=>`
					<div class="carousel-item ${i===0?'active':''}">
						<div class="card">
							<div class="card-body">
								<p class="mb-1">“${x.c}”</p>
								<div class="text-secondary small">—— ${x.n}</div>
							</div>
						</div>
					</div>`).join('')}
				</div>
			</div>
		</section>

		<div id="homeEnd"></div>
		`;
	},
	mount(root){
		// 自动轮播
		const el = root.querySelector('#carouselTestimonials');
		if (el){
			new bootstrap.Carousel(el, { interval: 3000, pause: 'hover' });
		}
		// 了解功能：滚动至首页底部
		const btnLearn = root.querySelector('#btnLearn');
		if (btnLearn){
			btnLearn.addEventListener('click', ()=>{
				const end = root.querySelector('#homeEnd') || root.lastElementChild;
				end?.scrollIntoView({ behavior: 'smooth', block: 'end' });
			});
		}
	}
};

window.PageNotFound = {
	async render(){
		return `
		<div class="text-center my-5">
			<h1 class="h3">页面不存在</h1>
			<p class="text-secondary">请返回 <a href="#/home">首页</a></p>
		</div>`;
	}
};


