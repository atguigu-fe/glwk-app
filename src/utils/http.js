/*
 * @Author: 朽木白
 * @Date: 2022-08-22 09:47:09
 * @LastEditors: 1547702880@qq.com
 * @LastEditTime: 2022-08-22 10:13:02
 * @Description:
 */
import store from '@/store/index';
import { TOKEN_KEY } from '@/config/storage-key';
import APIConfig from '@/config';

let baseUrl = '';
if (process.env.NODE_ENV === 'development') {
  console.log('开发环境');
  baseUrl = 'http://demonuxtapi.dishait.cn/mobile';
} else {
  console.log('生产环境');
  // baseUrl = 'https://cnodejs.org/api/v1/';
}

class Service {
  api(opts = {}) {
    // 监听网络状态
    uni.onNetworkStatusChange((res) => {
      if (!res.isConnected) {
        uni.showToast({
          title: '网络连接不可用！',
          icon: 'none',
        });
      }
      return false;
    });

    // 定义参数对象
    if (!opts.method) opts.method = 'get';
    if (opts.domain) baseUrl = opts.domain;

    // 鉴权
    let token = store.state.token;
    let authorize = '';
    if (uni.getStorageSync(TOKEN_KEY)) token = uni.getStorageSync(TOKEN_KEY);
    if (uni.getStorageSync('Authorization'))
      authorize = uni.getStorageSync('Authorization');

    const header = {
      token,
      'Content-type': 'application/json; charset=UTF-8',
      appid: APIConfig.appid,
    };

    // 删除鉴权
    if (opts.noAuth) {
      delete header.Authorization;
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: baseUrl + opts.url,
        data: opts.data,
        method: opts.menthod,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data) {
              resolve(data);
            } else if (res.data.returnCode === '401') {
              uni.showModal({
                title: '提示',
                content: '登录过期，请重新登录',
                success: function (res) {
                  if (res.confirm) {
                    uni.redirectTo({
                      url: '/pages/login/index',
                    });
                    uni.clearStorageSync();
                  } else if (res.cancel) {
                    uni.switchTab({
                      url: '/pages/index/index',
                    });
                  }
                },
              });
              resolve(res.data);
            } else {
              uni.showToast({
                title: res.data.returnMessage,
                icon: 'none',
                duration: 1500,
              });
              reject(res.data);
            }
          }
        },
        fail: () => {
          // uni.hideLoading();
          uni.showToast({
            title: 'net error!',
            icon: 'none',
            duration: 1500,
          });
        },
      });
    });
  }

  get(options = {}) {
    options.method = 'GET';
    return this.api(options);
  }

  post(options = {}) {
    options.method = 'POST';
    return this.api(options);
  }

  pus(options = {}) {
    options.method = 'PUT';
    return this.api(options);
  }

  delete(options = {}) {
    options.method = 'DELETE';
    return this.api(options);
  }
}

export default Service;