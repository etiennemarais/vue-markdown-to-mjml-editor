import Axios from 'axios'

export default class BurstsMjmlApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl
        this.Http = Axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
    }

    render(data = null) {
        return this.post('/', data)
    }

    get(url) {
        return this.request('get', url)
    }

    post (url, data = null) {
        return this.request('post', url, data)
    }

    request(requestType, url, data = null) {
        const burstsMjmlApi = this
        return new Promise((resolve, reject) => {
            burstsMjmlApi.Http[requestType](url, data).then((response) => {
                resolve(response)
            }, (error) => {
                reject(error.response)
            })
        })
    }
}
