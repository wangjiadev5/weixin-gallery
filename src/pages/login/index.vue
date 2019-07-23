<template>
	<div class="login_page">
		<p class="content" style="font-size: 50rpx;">登录页面</p>
		<div class="user_image">
			<image style="width: 300rpx; height: 300rpx;" src="/static/images/user.png"></image>
		</div>
		<view class='diver'></view>
		<div class="content">
			<p style="font-size: 50rpx;">申请获取以下权限</p>
			<p style="font-size: 45rpx; color: #AAAAAA; margin-top: 30rpx; margin-bottom: 100rpx;">获得你的公开信息（昵称，头像等）</p>
		</div>
		<i-button type="success" shape="circle" open-type="getUserInfo" @getuserinfo="onGotUserInfo">授权登录</i-button>
	</div>
</template>

<script>
	// import {cloud} from '../../api/varjd.js'

	export default {
		data() {
			return {}
		},
		methods: {
			login(){
				wx.login({
					success(res) {
						if (res.code) {
							console.log('111111111111111111')
							wx.switchTab({
								url: '/pages/openfile/main'
							})
							//发起网络请求
							// wx.cloud.callFunction({
							// 		// 云函数名称
							// 		name: 'login',
							// 		// 传给云函数的参数
							// 		data: {
							// 			code: res.code
							// 		},
							// 	})
							// 	.then(res => {
							// 	})
							// 	.catch(console.error)
						}
					}
				})
			},
			onGotUserInfo: function(e) {
				var that=this
				console.log(e.mp.detail.errMsg)
				if(e.mp.detail.errMsg=='getUserInfo:ok'){
					console.log('正在登录。。')
					wx.checkSession({
						success(res) {
							//session_key 未过期，并且在本生命周期一直有效
						},
						fail(err) {
							// session_key 已经失效，需要重新执行登录流程
							that.login()
						}
					})
				}
				else{
					return
				}
			}
		}
	}
</script>

<style scoped="scoped">
	.user_image {
		width: 100%;
		height: 400rpx;
		text-align: center;
	}

	.diver {
		background: #AAAAAA;
		width: 50%;
		height: 3rpx;
		margin-left: auto;
		margin-right: auto;
	}

	.login_page {}

	.content {
		font-family: "宋体";
		margin-top: 40rpx;
		margin-left: 20rpx;
	}
</style>
