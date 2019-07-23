<template>
	<view class='ui_uploader_cell'>
		<!-- 根据已选择的图片临时路径数组展示图片-->
		<view class='ui_uploader_item' v-for="up in uploaderList" :key="index">
			<!-- <image style="width: 200px; height: 200px; background-color: #eeeeee;" src="up"></image> -->
			<!-- 删除-->
			<icon class='ui_uploader_item_icon' @click='clearImg' :data-index="index" type="clear" size="20" color="red" />
			<!-- 图片-->
			<image class='image_show' @click='showImg' :data-index="index" :src='up'></image>
		</view>
		<!-- 上传按钮+框 -->
		<view class='ui_uploader' @click='upload' v-if="showUpload"></view>
		<!-- <button @click="getImageList">获取用户图片数据</button> -->
		<!-- <button @click="getImageTmpPath">获取图片路径</button> -->
		<button @click="showClearBut">删除图片</button>
		<button @click="disClearBut">取消删除</button>
		<p class="clear_float">图片列表</p>
		<ul>
			<li v-for="imagePath in imagePaths" :key='index'>
				<view class='ui_uploader_item'>
					<!-- <image style="width: 200px; height: 200px; background-color: #eeeeee;" src="up"></image> -->
					<!-- 删除-->
					<icon v-if='isShowClear' class='ui_uploader_item_icon' @click='clearCloudImg(index)' :data-index="index" type="clear"
					 size="20" color="red" />
					<!-- 图片-->
					<image class='image_show' @click='showImg(index)' :data-index="index" :src='imagePath'></image>
				</view>
			</li>
		</ul>
	</view>
</template>

<script>
	import {
		imageCollection
	} from '../../api/varjd.js'
	var fileID = ''
	var filePaths = []
	var i = 0
	var tmpImagePath
	var cloudFileID=''
	export default {
		methods: {
			//展示删除按钮
			showClearBut: function(e) {
				this.$data.isShowClear = true
			},
			disClearBut: function(e) {
				this.$data.isShowClear = false
			},
			//删除云端的图片
			clearCloudImg: function(index) {
				wx.showToast({
					title:'正在删除',
					icon:'loading'
				})
				var that=this
				this.$data.fileList.push(this.$data.fileIDList[index])
				wx.cloud.deleteFile({
					fileList: this.$data.fileList
				}).then(res => {
					// handle success
					wx.showToast({
						title:'删除成功'
					})
					imageCollection.where({
										_openid: 'oXHld5ZUgg56dop5oxULGE6AIzw0' ,// 填入当前用户 openid
										fileID:this.$data.fileIDList[index],
									}).get().then(res => {
										this.$data.fileInfoList = res.data
										cloudFileID=this.$data.fileInfoList[0]._id
											imageCollection.doc(cloudFileID).remove()
											.then(res=>{
												this.$data.fileIDList.splice(index,1)
												wx.hideLoading()
												new Promise(function(resolve, reject) {
													//做一些异步操作
													setTimeout(function() {
														that.getImageList()
													}, 500);
												});
											})
											.catch(console.error)
											
									})
				}).catch(error => {
					// handle error
					wx.showToast({
						title: error,
					})
				})
			},
			// 删除图片
			clearImg: function(e) {
				var nowList = []; //新数据
				var uploaderList = this.$data.uploaderList; //原数据

				for (let i = 0; i < uploaderList.length; i++) {
					if (i == e.currentTarget.dataset.index) {
						continue;
					} else {
						nowList.push(uploaderList[i])
					}
				}
				this.$data.uploaderNum = this.$data.uploaderNum - 1
				this.$data.uploaderList = nowList
				this.$data.showUpload = true
			},
			//展示图片
			showImg: function(index) {
				var that = this;
				wx.previewImage({
					urls: that.$data.imagePaths,
					current: that.$data.imagePaths[index]
				})
			},
			//上传图片
			upload(res) {
				var that = this;
				wx.chooseImage({
					count: 9 - that.$data.uploaderNum, // 默认9
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
					success: function(res) {
						// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
						let tempFilePaths = res.tempFilePaths;
						let pic_name = tempFilePaths[0].match(/tmp[_,\/](\S*)\./)[1] + tempFilePaths[0].match(/\.[^.]+?$/)[0]
						let cloudPath = 'xinxin/' + pic_name //处理文件，将路径中的文件名截取出来，拼接成服务器中的文件路径
						wx.showLoading({
							title: '上传中',
						})
						//调用微信上传文件api
						wx.cloud.uploadFile({
							cloudPath: cloudPath,
							filePath: tempFilePaths[0], // 文件路径
							success: res => {
								// get resource ID
								fileID = res.fileID
								wx.showToast({
									icon: 'none',
									title: '上传成功',
								})
								//将上传的图片的路径插入数据库中
								imageCollection.add({
										// data 字段表示需新增的 JSON 数据
										data: {
											description: "image path",
											path: tempFilePaths[0],
											name: pic_name,
											fileID: fileID
										}
									})
									.then(res => {})
									.catch(console.error)
							},
							fail: err => {
								// handle error
								wx.showToast({
									icon: 'none',
									title: err,
								})
							},
							complete(res) {
								wx.hideLoading()
								new Promise(function(resolve, reject) {
									//做一些异步操作
									setTimeout(function() {
										that.getImageList()
									}, 500);
								});
							}
						})
						let uploaderList = that.$data.uploaderList.concat(tempFilePaths);
						// 						//上传图片张数的限制
						// 						if (uploaderList.length == 9) {
						// 							that.$data.showUpload = false
						// 						}
						that.$data.uploaderList = uploaderList
						that.$data.uploaderNum = uploaderList.length
					}
				})
			},
			getImageList() {
				this.$data.fileInfoList=[]
				imageCollection.where({
					_openid: 'oXHld5ZUgg56dop5oxULGE6AIzw0' // 填入当前用户 openid
				}).get().then(res => {
					this.$data.fileInfoList = res.data
					for (i; i < this.$data.fileInfoList.length; i++) {
						this.$data.fileIDList.push(this.$data.fileInfoList[i].fileID)
					}
				}).then(res=>{
					this.getImageTmpPath()
				}).catch(err=>{
				})
			},
			getImageTmpPath() {
				var image_paths = []
				this.$data.filePaths=[]
				wx.cloud.getTempFileURL({
					fileList: this.$data.fileIDList
				}).then(res => {
					// get temp file URL
					this.$data.filePaths = res.fileList
					for (i = 0; i < this.$data.filePaths.length; i++) {
						if(this.$data.filePaths[i].tempFileURL!=null&&this.$data.filePaths[i].tempFileURL!='')
						{
							image_paths.push(this.$data.filePaths[i].tempFileURL)
						}
					}
					this.$data.imagePaths = image_paths
					wx.hideLoading()
				}).catch(error => {
					// handle error
				})
			}
		},
		data() {
			return {
				fileList:[],
				filePaths:[],
				fileIDList:[],
				fileInfoList:[],
				uploaderList: [],
				uploaderNum: 0,
				showUpload: true,
				imagePaths: [],
				isShowClear: false
			}
		},
		created() {
			//调用微信api的时候，初始化环境
			wx.cloud.init({
				env: 'wjd-ai-de62b'
			})
		},
		mounted() {
			wx.showLoading({
				title: '加载中',
			})
			var that=this
			new Promise(function(resolve, reject) {
				//做一些异步操作
				setTimeout(function() {
					that.$emit().getImageList()
				}, 500);
			});
		},
		destroy() {
			//关闭数据库
		},
	}
</script>

<style scoped="scoped">
	.clear_float {
		clear: both;
		font-size: 50rpx;
		margin-bottom: 20rpx;
		margin-top: 20rpx;
	}

	.imageListShow {
		float: left;
		margin-left: 25rpx;
		margin-bottom: 25rpx;
		width: 29%;
		height: 185rpx;
		border: 2rpx solid #d9d9d9;
		box-sizing: border-box;
	}

	.image_show {
		float: left;
		position: relative;
		margin-right: 25rpx;
		margin-bottom: 25rpx;
		width: 165rpx;
		height: 165rpx;
		border: 2rpx solid #d9d9d9;
		box-sizing: border-box;
		z-index: 0;
	}

	/* uploader */
	.ui_uploader_cell {
		width: 100%;
		padding: 40rpx;
		box-sizing: border-box;
	}

	.ui_uploader_item {
		float: left;
		position: relative;
		margin-bottom: 28rpx;
		margin-left: 14rpx;
		width: 30%;
		height: 175rpx;
	}

	.ui_uploader_item_icon {
		position: absolute;
		right: -18rpx;
		top: -18rpx;
		background: #fff;
		border-radius: 50%;
		z-index: 1;
	}

	.ui_uploader {
		float: left;
		position: relative;
		margin-right: 25rpx;
		margin-bottom: 25rpx;
		width: 165rpx;
		height: 165rpx;
		border: 2rpx solid #d9d9d9;
		box-sizing: border-box;
	}

	.ui_uploader:before {
		content: " ";
		position: absolute;
		width: 4rpx;
		height: 79rpx;
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #d9d9d9;
	}

	.ui_uploader:after {
		content: " ";
		position: absolute;
		height: 4rpx;
		width: 79rpx;
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #d9d9d9;
	}
</style>
