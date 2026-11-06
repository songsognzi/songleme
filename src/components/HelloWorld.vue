<template>
  <div class="phone">
    <div class="app">
      <!-- 店铺头部 -->
      <header class="hero">
        <div class="hero-inner">
          <div class="shop-logo">御</div>
          <div class="shop-info">
            <h1 class="shop-name">小宋的御膳房</h1>
            <p class="shop-slogan">御膳私房菜 · 当日现做 · 慢工细火</p>
            <div class="shop-badges">
              <span class="hero-badge">★ 4.9</span>
              <span class="hero-badge">月售 2.1万</span>
              <span class="hero-badge">约 30 分钟</span>
            </div>
          </div>
        </div>
        <p class="hero-notice">公告：本店只做当日新鲜食材，只为我最亲爱的周老师供应 ~</p>
      </header>

      <!-- 左侧分类 + 右侧菜品 -->
      <div class="body">
        <nav class="cats">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="cat"
            :class="{ active: activeCat === cat.id }"
            @click="scrollToCat(cat.id)"
          >
            <span class="cat-name">{{ cat.name }}</span>
            <span v-if="catCount(cat)" class="cat-dot">{{ catCount(cat) }}</span>
          </button>
          <p class="cats-pad">御膳</p>
        </nav>

        <main ref="menu" class="menu" @scroll="onMenuScroll">
          <section
            v-for="cat in categories"
            :key="cat.id"
            class="group"
            :ref="el => registerSection(el, cat.id)"
          >
            <h2 class="group-title">{{ cat.name }}</h2>
            <ul class="dishes">
              <li v-for="dish in cat.dishes" :key="dish.id" class="dish">
                <div class="thumb">
                  <img
                    v-if="!broken[dish.id]"
                    :src="dish.img"
                    :alt="dish.name"
                    loading="lazy"
                    @error="broken[dish.id] = true"
                  >
                  <span v-else class="thumb-fallback">{{ dish.emoji }}</span>
                  <span v-if="qty(dish.id)" class="thumb-count">{{ qty(dish.id) }}</span>
                </div>
                <div class="dish-main">
                  <p class="dish-name">
                    {{ dish.name }}
                    <span v-if="dish.tag" class="dish-tag">{{ dish.tag }}</span>
                  </p>
                  <p class="dish-desc">{{ dish.desc }}</p>
                  <p class="dish-sales">月售 {{ dish.sales }}</p>
                  <div class="dish-bottom">
                    <p class="price"><i>¥</i>{{ dish.price }}</p>
                    <div class="stepper" :class="{ on: qty(dish.id) }">
                      <button class="step minus" @click.stop="dec(dish)">−</button>
                      <span class="step-num">{{ qty(dish.id) }}</span>
                      <button class="step plus" @click.stop="inc(dish)">+</button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </section>
          <p class="menu-end">—— 御膳房 · 匠心出品 ——</p>
        </main>
      </div>

      <!-- 悬浮购物车 -->
      <div class="fly-cart" :class="{ dim: !cartCount }" @click="openCart">
        <svg class="cart-svg" viewBox="0 0 24 24">
          <path
            d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="10" cy="19.4" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="19.4" r="1.5" fill="currentColor" />
        </svg>
        <span v-if="cartCount" class="fly-dot">{{ cartCount }}</span>
      </div>

      <!-- 底部购物车条 -->
      <footer class="bar">
        <div class="bar-cart" :class="{ dim: !cartCount }" @click="openCart">
          <svg class="cart-svg" viewBox="0 0 24 24">
            <path
              d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="10" cy="19.4" r="1.5" fill="currentColor" />
            <circle cx="17.5" cy="19.4" r="1.5" fill="currentColor" />
          </svg>
          <span v-if="cartCount" class="bar-dot">{{ cartCount }}</span>
        </div>
        <div class="bar-price">
          <p class="bar-total">
            <template v-if="cartCount"><i>¥</i>{{ payable.toFixed(2) }}</template>
            <template v-else>未选购菜品</template>
          </p>
          <p class="bar-tip">已免配送费 · 满 88 减 20</p>
        </div>
        <button class="bar-btn" :class="{ off: !cartCount }" @click="checkout">去下单</button>
      </footer>

      <!-- 购物车详情 -->
      <transition name="fade">
        <div v-if="cartOpen" class="mask" @click.self="cartOpen = false"></div>
      </transition>
      <transition name="sheet">
        <div v-if="cartOpen" class="sheet">
          <div class="sheet-head">
            <h3>已点菜品 <span class="sheet-sub">共 {{ cartCount }} 份</span></h3>
            <button class="clear" @click="clearCart">清空</button>
          </div>
          <ul class="sheet-list">
            <li v-for="item in cartItems" :key="item.id" class="sheet-item">
              <div class="sheet-thumb">
                <img
                  v-if="!broken[item.id]"
                  :src="item.img"
                  :alt="item.name"
                  @error="broken[item.id] = true"
                >
                <span v-else>{{ item.emoji }}</span>
              </div>
              <div class="sheet-info">
                <p class="sheet-name">{{ item.name }}</p>
                <p class="sheet-desc">{{ item.desc }}</p>
              </div>
              <p class="sheet-price">¥{{ item.price * item.qty }}</p>
              <div class="stepper on">
                <button class="step minus" @click="dec(item)">−</button>
                <span class="step-num">{{ item.qty }}</span>
                <button class="step plus" @click="inc(item)">+</button>
              </div>
            </li>
          </ul>
          <div class="sheet-total">
            <span>合计 <b>¥{{ payable.toFixed(2) }}</b></span>
            <span v-if="discount" class="sheet-save">已减 ¥{{ discount }}</span>
          </div>
        </div>
      </transition>

      <!-- 下单成功 -->
      <transition name="fade">
        <div v-if="order" class="done">
          <div class="done-card">
            <div class="done-seal">御膳房</div>
            <h3 class="done-title">御膳已下单</h3>
            <p class="done-no">订单号 {{ order.no }}</p>
            <div class="done-lines">
              <p><span>菜品</span><b>{{ order.count }} 份</b></p>
              <p><span>实付</span><b>¥{{ order.total }}</b></p>
              <p><span>预计送达</span><b>{{ order.eta }}</b></p>
            </div>
            <p class="done-tip">后厨已开始备膳，请耐心等候 ~</p>
            <button class="done-btn" @click="finishOrder">再点一单</button>
          </div>
        </div>
      </transition>

      <transition name="toast">
        <div v-if="toast" class="toast">{{ toast }}</div>
      </transition>
    </div>
  </div>
</template>

<script>
// src/assets 下的照片，排序后依次铺给菜品，菜比照片多时循环复用
const photoFiles = require.context('../assets', false, /\.jpg$/)
const PHOTOS = photoFiles.keys().sort().map(key => {
  const file = photoFiles(key)
  return typeof file === 'string' ? file : file.default
})

export default {
  name: 'HelloWorld',
  data() {
    return {
      activeCat: 'c1',
      cart: {},
      cartOpen: false,
      toast: '',
      order: null,
      broken: {},
      categories: [
        {
          id: 'c1',
          name: '招牌御膳',
          dishes: [
            { id: 'd1', name: '御膳红烧肉', desc: '想把你喂圆一点，这样就跑不掉了', price: 48, sales: 1280, tag: '招牌', emoji: '🍖' },
            { id: 'd2', name: '果木烤鸭', desc: '果木慢烤，只为换你一句真香', price: 168, sales: 860, tag: '招牌', emoji: '🦆' },
            { id: 'd3', name: '佛跳墙', desc: '佛跳墙都翻墙来看你，何况我', price: 198, sales: 420, emoji: '🍲' },
            { id: 'd4', name: '松鼠鳜鱼', desc: '酸甜刚好，像初见你的心跳', price: 88, sales: 690, emoji: '🐟' }
          ]
        },
        {
          id: 'c2',
          name: '山珍海味',
          dishes: [
            { id: 'd5', name: '蒜蓉粉丝扇贝', desc: '最好的一口留给你，是我的规矩', price: 38, sales: 960, emoji: '🐚' },
            { id: 'd6', name: '清蒸东星斑', desc: '清蒸原味，爱你也想不加修饰', price: 128, sales: 380, emoji: '🐠' },
            { id: 'd7', name: '油焖大虾', desc: '虾给你剥好，问就是我愿意', price: 78, sales: 820, emoji: '🦐' },
            { id: 'd8', name: '葱烧海参', desc: '海参慢煨，等你慢慢来，不急', price: 98, sales: 460, emoji: '🥘' },
            { id: 'd9', name: '麻辣小龙虾', desc: '麻辣上头，也不如你上头', price: 88, sales: 1500, tag: '热销', emoji: '🦞' }
          ]
        },
        {
          id: 'c3',
          name: '时令小炒',
          dishes: [
            { id: 'd10', name: '宫保鸡丁', desc: '荔枝口回甜，是想你的味道', price: 38, sales: 1750, tag: '热销', emoji: '🍗' },
            { id: 'd11', name: '麻婆豆腐', desc: '豆腐再嫩，也没你说话软', price: 26, sales: 1320, emoji: '🥘' },
            { id: 'd12', name: '干煸四季豆', desc: '锅气再足，也压不住我心里的火', price: 28, sales: 980, emoji: '🥬' },
            { id: 'd13', name: '鱼香肉丝', desc: '咸甜酸辣都齐，只缺你一个', price: 32, sales: 1420, emoji: '🥢' },
            { id: 'd14', name: '手撕包菜', desc: '手撕包菜，撕不掉对你的惦记', price: 22, sales: 1100, emoji: '🥬' },
            { id: 'd15', name: '番茄炒蛋', desc: '最家常的菜，配最想天天见的人', price: 24, sales: 2000, emoji: '🍅' }
          ]
        },
        {
          id: 'c4',
          name: '汤羹粥品',
          dishes: [
            { id: 'd16', name: '文思豆腐羹', desc: '千丝万缕，切的全是你', price: 32, sales: 380, emoji: '🍜' },
            { id: 'd17', name: '老火例汤', desc: '煲足四小时，像等你回消息', price: 36, sales: 720, emoji: '🍲' },
            { id: 'd18', name: '银耳莲子羹', desc: '银耳炖出胶，我熬了一肚子想你', price: 28, sales: 640, emoji: '🥣' },
            { id: 'd19', name: '皮蛋瘦肉粥', desc: '早起熬一碗粥，只为听你说好喝', price: 22, sales: 1180, emoji: '🥣' }
          ]
        },
        {
          id: 'c5',
          name: '主食点心',
          dishes: [
            { id: 'd20', name: '扬州炒饭', desc: '粒粒分明，像你说过的每句话', price: 28, sales: 1620, emoji: '🍚' },
            { id: 'd21', name: '蟹黄小笼包', desc: '先咬一小口，烫着我心疼', price: 38, sales: 1240, tag: '招牌', emoji: '🥟' },
            { id: 'd22', name: '桂花糕', desc: '桂花清甜，像不用加糖的你', price: 18, sales: 560, emoji: '🍡' },
            { id: 'd23', name: '阳春面', desc: '一碗清汤细面，最想的日常', price: 20, sales: 880, emoji: '🍜' }
          ]
        },
        {
          id: 'c6',
          name: '琼浆玉液',
          dishes: [
            { id: 'd24', name: '桂花酒酿饮', desc: '微醺刚好，多一口就是你了', price: 18, sales: 720, emoji: '🍶' },
            { id: 'd25', name: '古法酸梅汤', desc: '解腻如你，解我所有不开心', price: 12, sales: 1680, tag: '热销', emoji: '🥤' },
            { id: 'd26', name: '明前龙井', desc: '回甘绵长，是想你的后劲', price: 28, sales: 340, emoji: '🍵' },
            { id: 'd27', name: '现榨西瓜汁', desc: '把整个夏天榨成一杯给你', price: 16, sales: 910, emoji: '🍉' }
          ]
        }
      ]
    }
  },
  computed: {
    allDishes() {
      return this.categories.reduce((list, cat) => list.concat(cat.dishes), [])
    },
    cartItems() {
      return this.allDishes
        .filter(dish => this.cart[dish.id])
        .map(dish => ({ ...dish, qty: this.cart[dish.id] }))
    },
    cartCount() {
      return this.cartItems.reduce((n, item) => n + item.qty, 0)
    },
    subtotal() {
      return this.cartItems.reduce((n, item) => n + item.qty * item.price, 0)
    },
    discount() {
      return this.subtotal >= 88 ? 20 : 0
    },
    payable() {
      return this.subtotal - this.discount
    }
  },
  created() {
    this._sections = {}
    this._toastTimer = null
    this._lockTimer = null
    this.allDishes.forEach((dish, index) => {
      dish.img = PHOTOS[index % PHOTOS.length]
    })
  },
  beforeUnmount() {
    clearTimeout(this._toastTimer)
    clearTimeout(this._lockTimer)
  },
  methods: {
    qty(id) {
      return this.cart[id] || 0
    },
    catCount(cat) {
      return cat.dishes.reduce((n, dish) => n + this.qty(dish.id), 0)
    },
    registerSection(el, id) {
      if (el) this._sections[id] = el
    },
    scrollToCat(id) {
      this.activeCat = id
      const section = this._sections[id]
      if (!section || !this.$refs.menu) return
      this._lockScroll = true
      this.$refs.menu.scrollTop = section.offsetTop
      clearTimeout(this._lockTimer)
      this._lockTimer = setTimeout(() => { this._lockScroll = false }, 320)
    },
    onMenuScroll() {
      if (this._lockScroll || !this.$refs.menu) return
      const top = this.$refs.menu.scrollTop + 14
      let current = this.categories[0].id
      this.categories.forEach(cat => {
        const section = this._sections[cat.id]
        if (section && section.offsetTop <= top) current = cat.id
      })
      this.activeCat = current
    },
    inc(dish) {
      const had = this.qty(dish.id) > 0
      this.cart[dish.id] = this.qty(dish.id) + 1
      if (!had) this.showToast('已为您备下「' + dish.name + '」')
    },
    dec(dish) {
      const next = this.qty(dish.id) - 1
      if (next <= 0) delete this.cart[dish.id]
      else this.cart[dish.id] = next
    },
    showToast(text) {
      this.toast = text
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => { this.toast = '' }, 1600)
    },
    openCart() {
      if (!this.cartCount) {
        this.showToast('还没有点菜哦，先来几道御膳吧 ~')
        return
      }
      this.cartOpen = true
    },
    clearCart() {
      this.cart = {}
      this.cartOpen = false
      this.showToast('已清空御膳清单')
    },
    checkout() {
      if (!this.cartCount) {
        this.openCart()
        return
      }
      const pad = n => String(n).padStart(2, '0')
      const arrive = new Date(Date.now() + 30 * 60 * 1000)
      this.order = {
        no: 'YS' + Date.now().toString().slice(-8),
        count: this.cartCount,
        total: this.payable.toFixed(2),
        eta: pad(arrive.getHours()) + ':' + pad(arrive.getMinutes())
      }
      this.cartOpen = false
    },
    finishOrder() {
      this.order = null
      this.cart = {}
    }
  }
}
</script>

<style scoped>
.phone {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at 50% 0%, #3a2f26 0%, #17140f 70%);
}

.app {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 390px;
  height: 100%;
  max-height: 844px;
  overflow: hidden;
  border-radius: 30px;
  background: #f7f5f1;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  color: #2b2723;
  text-align: left;
}

/* 店铺头部 */
.hero {
  flex: none;
  position: relative;
  padding: 18px 16px 12px;
  background: linear-gradient(135deg, #8c1f18 0%, #b32b1f 55%, #7d1a13 100%);
  color: #fff;
  overflow: hidden;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 214, 122, 0.18) 1px, transparent 1px);
  background-size: 12px 12px;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.shop-logo {
  flex: none;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7d167, #d19b16);
  color: #7d1a13;
  font-size: 22px;
  font-weight: 700;
  font-family: 'Songti SC', serif;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.shop-info {
  min-width: 0;
  flex: 1;
}

.shop-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff8e6;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.shop-slogan {
  margin: 4px 0 0;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.75);
}

.shop-badges {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hero-badge {
  padding: 2px 7px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 10px;
  color: #ffe9c4;
}

.hero-notice {
  position: relative;
  z-index: 1;
  margin: 12px 0 0;
  padding: 5px 9px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.18);
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.86);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主体 */
.body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.cats {
  flex: none;
  width: 88px;
  overflow-y: auto;
  background: #efece6;
  padding-bottom: 8px;
}

.cats::-webkit-scrollbar,
.menu::-webkit-scrollbar {
  width: 4px;
}

.cats::-webkit-scrollbar-thumb,
.menu::-webkit-scrollbar-thumb {
  background: rgba(140, 31, 24, 0.18);
  border-radius: 2px;
}

.cat {
  position: relative;
  display: block;
  width: 100%;
  padding: 15px 8px;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1.3;
  color: #6b6259;
  cursor: pointer;
}

.cat.active {
  background: #fff;
  color: #8c1f18;
  font-weight: 700;
}

.cat.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 18px;
  margin-top: -9px;
  border-radius: 0 3px 3px 0;
  background: #c9a227;
}

.cat-dot {
  position: absolute;
  right: 6px;
  top: 7px;
  box-sizing: border-box;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: #e6452f;
  color: #fff;
  font-size: 9.5px;
  font-weight: 400;
  line-height: 15px;
  text-align: center;
}

.cats-pad {
  margin: 10px 0 4px;
  font-size: 9.5px;
  letter-spacing: 2px;
  color: #c3b9ad;
  text-align: center;
}

.menu {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 96px;
  background: #fff;
}

.group-title {
  position: sticky;
  top: 0;
  z-index: 2;
  margin: 0;
  padding: 12px 0 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  color: #2f2a24;
}

.group-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 12px;
  margin-right: 6px;
  border-radius: 2px;
  background: #c9a227;
  vertical-align: -1px;
}

.dishes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dish {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px dashed #f1ece4;
}

.thumb {
  position: relative;
  flex: none;
  width: 84px;
  height: 84px;
  border-radius: 10px;
  overflow: hidden;
  background: #f4f0eb;
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 34px;
  background: linear-gradient(135deg, #fdf3e3, #f6e6cc);
}

.thumb-count {
  position: absolute;
  top: 0;
  right: 0;
  box-sizing: border-box;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 0 10px 0 10px;
  background: #e6452f;
  color: #fff;
  font-size: 10px;
  line-height: 17px;
  text-align: center;
}

.dish-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.dish-name {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  color: #2b2723;
}

.dish-tag {
  margin-left: 5px;
  padding: 0 3px;
  border: 1px solid rgba(201, 162, 39, 0.6);
  border-radius: 3px;
  font-size: 9px;
  font-weight: 400;
  color: #b8860b;
  vertical-align: 1px;
}

.dish-desc {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: #9a9188;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-sales {
  margin: 3px 0 0;
  font-size: 11px;
  color: #b3aaa1;
}

.dish-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
}

.price {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #e03a1e;
}

.price i {
  margin-right: 1px;
  font-size: 11px;
  font-style: normal;
}

/* 加减 */
.stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step {
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  font-family: inherit;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.plus {
  background: linear-gradient(135deg, #f5cd5b, #e0a91c);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(214, 163, 26, 0.35);
}

.minus {
  border: 1px solid #e6cfa8;
  background: #fff;
  color: #d9a318;
}

.step-num {
  display: none;
  min-width: 16px;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #2b2723;
}

.stepper .minus,
.stepper .step-num {
  display: none;
}

.stepper.on .minus {
  display: grid;
}

.stepper.on .step-num {
  display: block;
}

.menu-end {
  margin: 18px 0 6px;
  font-size: 10px;
  letter-spacing: 1px;
  color: #c9c0b5;
  text-align: center;
}

/* 悬浮购物车 */
.fly-cart {
  position: absolute;
  right: 14px;
  bottom: 74px;
  z-index: 6;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(201, 162, 39, 0.55);
  border-radius: 50%;
  background: #241f1a;
  color: #f0c34a;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.fly-cart.dim {
  color: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.16);
}

.cart-svg {
  width: 24px;
  height: 24px;
}

.fly-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  box-sizing: border-box;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #e6452f;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
}

/* 底部购物车条 */
.bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 12px 0 14px;
  background: #241f1a;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.18);
}

.bar-cart {
  position: relative;
  flex: none;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5cd5b, #d19b16);
  color: #6b4a05;
  cursor: pointer;
}

.bar-cart.dim {
  background: #4a4239;
  color: rgba(255, 255, 255, 0.3);
}

.bar-dot {
  position: absolute;
  top: -3px;
  right: -3px;
  box-sizing: border-box;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  border: 2px solid #241f1a;
  border-radius: 10px;
  background: #e6452f;
  color: #fff;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
}

.bar-price {
  flex: 1;
  min-width: 0;
}

.bar-total {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #ffd76a;
}

.bar-total i {
  margin-right: 1px;
  font-size: 11px;
  font-style: normal;
}

.bar-tip {
  margin: 3px 0 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.bar-btn {
  flex: none;
  height: 38px;
  padding: 0 22px;
  border: 0;
  border-radius: 19px;
  background: linear-gradient(135deg, #f7d167, #dfa418);
  color: #4a3405;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(214, 163, 26, 0.3);
}

.bar-btn.off {
  background: #4a4239;
  color: rgba(255, 255, 255, 0.35);
  box-shadow: none;
  cursor: default;
}

/* 购物车详情 */
.mask {
  position: absolute;
  inset: 0;
  z-index: 8;
  background: rgba(20, 16, 12, 0.45);
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 60px;
  z-index: 9;
  display: flex;
  flex-direction: column;
  max-height: 62%;
  border-radius: 16px 16px 0 0;
  background: #fff;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.18);
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
  border-bottom: 1px solid #f2ece4;
}

.sheet-head h3 {
  margin: 0;
  font-size: 14px;
  color: #2b2723;
}

.sheet-sub {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 400;
  color: #a49a90;
}

.clear {
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: #a49a90;
  cursor: pointer;
}

.sheet-list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 2px 14px 6px;
  overflow-y: auto;
  list-style: none;
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #f7f2ec;
}

.sheet-item:last-child {
  border-bottom: 0;
}

.sheet-thumb {
  flex: none;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  overflow: hidden;
  background: #f4f0eb;
  font-size: 21px;
}

.sheet-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sheet-info {
  flex: 1;
  min-width: 0;
}

.sheet-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #2b2723;
}

.sheet-desc {
  margin: 3px 0 0;
  font-size: 11px;
  color: #a49a90;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sheet-price {
  flex: none;
  margin: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: #e03a1e;
}

.sheet-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-top: 1px solid #f2ece4;
  background: #faf7f2;
  font-size: 12.5px;
  color: #6b6259;
}

.sheet-total b {
  margin-left: 4px;
  font-size: 16px;
  color: #e03a1e;
}

.sheet-save {
  padding: 2px 7px;
  border-radius: 9px;
  background: rgba(230, 69, 47, 0.1);
  font-size: 10.5px;
  color: #e6452f;
}

/* 下单成功 */
.done {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 26px;
  background: rgba(20, 16, 12, 0.62);
}

.done-card {
  width: 100%;
  box-sizing: border-box;
  padding: 26px 20px 20px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.done-seal {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 214, 122, 0.6);
  border-radius: 14px;
  background: linear-gradient(135deg, #c02a1e, #8c1f18);
  color: #ffe0a8;
  font-family: 'Songti SC', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  transform: rotate(-6deg);
  box-shadow: 0 8px 18px rgba(140, 31, 24, 0.35);
}

.done-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #2b2723;
}

.done-no {
  margin: 6px 0 16px;
  font-size: 11px;
  color: #a49a90;
}

.done-lines {
  padding: 12px 14px;
  border-radius: 12px;
  background: #faf7f2;
}

.done-lines p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 8px;
  font-size: 12.5px;
  color: #6b6259;
}

.done-lines p:last-child {
  margin-bottom: 0;
}

.done-lines b {
  color: #2b2723;
}

.done-lines p:nth-child(2) b {
  color: #e03a1e;
}

.done-tip {
  margin: 14px 0 16px;
  font-size: 11px;
  color: #b3aaa1;
}

.done-btn {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 21px;
  background: linear-gradient(135deg, #f7d167, #dfa418);
  color: #4a3405;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* 提示气泡 */
.toast {
  position: absolute;
  left: 50%;
  bottom: 132px;
  z-index: 30;
  padding: 8px 14px;
  border-radius: 20px;
  background: rgba(36, 31, 26, 0.92);
  color: #ffe6b8;
  font-size: 12px;
  white-space: nowrap;
  transform: translateX(-50%);
}

/* 过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.28s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(110%);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@media (max-width: 560px) {
  .phone {
    padding: 0;
  }

  .app {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
