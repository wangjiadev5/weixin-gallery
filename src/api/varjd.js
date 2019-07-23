wx.cloud.init({
	env: 'wjd-ai-de62b'
})

export const myDB = wx.cloud.database({
	env: 'wjd-ai-de62b'
})

export const imageCollection = wx.cloud.database({
	env: 'wjd-ai-de62b'
}).collection('imagedb')


// export const cloud = require('wx-server-sdk')