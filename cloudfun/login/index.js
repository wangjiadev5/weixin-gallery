// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
	// openid: wxContext.OPENID,
	var appid = wxContext.APPID
	// unionid: wxContext.UNIONID,
	var CODE = event.code
	const SECRET = 'e7e91407fb8f28e08cc12d222f2290f0'

	var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + SECRET + '&js_code=' + CODE +
		'&grant_type=authorization_code'

	var response = new Promise((resolve, reject) => {
		request.get(url, function(err, resp, body) {
			return resolve(body)
		})
	})
	
	
	

	return response
}
