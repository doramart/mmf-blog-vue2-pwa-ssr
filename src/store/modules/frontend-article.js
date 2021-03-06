import api from '~api'

const state = () => ({
    lists: {
        data: [],
        hasNext: 0,
        page: 1,
        path: ''
    },
    item: {
        data: {},
        path: '',
        isLoad: false
    },
    trending: []
})

const actions = {
    async ['getArticleList']({commit, state}, config) {
        if (state.lists.data.length > 0 && config.path === state.lists.path && config.page === 1) {
            return
        }
        let cookies
        if (config.cookies) {
            cookies = config.cookies
            delete config.cookies
        }
        const { data: { data, code} } = await api.get('frontend/article/list', {...config, cache: true}, cookies)
        if (data && code === 200) {
            commit('receiveArticleList', {
                ...config,
                ...data,
            })
        }
    },
    async ['getArticleItem']({ commit, state }, config) {
        if (config.path === state.item.path) {
            return
        }
        let cookies
        if (config.cookies) {
            cookies = config.cookies
            delete config.cookies
        }
        const { data: { data, code} } = await api.get('frontend/article/item', { ...config, markdown: 1, cache: true }, cookies)
        if (data && code === 200) {
            commit('receiveArticleItem', {
                data,
                ...config
            })
        }
    },
    async ['getTrending']({ commit, state }) {
        if (state.trending.length) return
        const { data: { data, code} } = await api.get('frontend/trending', { cache: true})
        if (data && code === 200) {
            commit('receiveTrending', data)
        }
    }
}

const mutations = {
    ['receiveArticleList'](state, {list, hasNext, hasPrev, page, path}) {
        if (page === 1) {
            list = [].concat(list)
        } else {
            list = state.lists.data.concat(list)
        }
        state.lists = {
            data: list, hasNext, hasPrev, page, path
        }
    },
    ['receiveArticleItem'](state, {data, path}) {
        state.item = {
            data, path, isLoad: true
        }
    },
    ['receiveTrending'](state, data) {
        state.trending = data.list
    },
    ['modifyLikeStatus'](state, {id, status}) {
        if (state.item.data._id === id) {
            if (status) state.item.data.like++
            else  state.item.data.like--
            state.item.data.like_status = status
        }
        const obj = state.lists.data.find(item => item._id === id)
        if (obj) {
            if (status) obj.like++
            else  obj.like--
            obj.like_status = status
        }
    }
}

const getters = {
    ['getArticleList'](state) {
        return state.lists
    },
    ['getArticleItem'](state) {
        return state.item
    },
    ['getTrending'](state) {
        return state.trending
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
