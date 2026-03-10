const url = "https://my.ippure.com/v1/info"

// 1. 设置默认参数
let args = {
  title: "IPPure",
  colorlow: "#00D42E",     // 默认低风险颜色
  colormid: "#93DE09",     // 默认中风险颜色
  colorhigh: "#FF9500",    // 默认高风险颜色
  colorextreme: "#FF3B30", // 默认极高风险颜色
  markip: "false"          // 默认不打码 IP
}

// 2. 解析传入的 $argument 键值对
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    let [key, value] = item.split('=');
    if (key && value) {
      args[key.trim().toLowerCase()] = value.trim();
    }
  });
}

// 是否给 IP 打码
const MarkIP = args.markip.toLowerCase() === 'true'

$httpClient.get(url, (err, resp, data) => {
  if (err) {
    $done({ title: args.title, content: "请求失败", icon: "network.slash" })
    return
  }

  const j = JSON.parse(data)
  const ip = j.ip
  const isIPv6 = ip.includes(':')
  const ipLabel = isIPv6 ? 'IPv6' : 'IPv4'
  const showIP = MarkIP ? maskIP(ip) : ip

  const flag = flagEmoji(j.countryCode)
  const nativeText = j.isResidential ? " [家宽]" : " [机房/商业]"
  const bbbb = j.isBroadcast ? " [广播]" : " [原生]"
  const risk = j.fraudScore

  let riskText
  let titleColor

  if (risk >= 75) {
    riskText = `极高风险 (${risk})`
    titleColor = args. colorextreme
  } else if (risk >= 55) {
    riskText = `高风险 (${risk})`
    titleColor = args.colorhigh
  } else if (risk >= 35) {
    riskText = `中等风险 (${risk})`
    titleColor = args.colormid
  } else if (risk >=15 ){
    riskText = `低风险 (${risk})`
    titleColor = args.colorlow
  }

  $done({
    title: "IPPure"
    content:
`${ipLabel}：${showIP}
ASN：AS${j.asn} ${j.asOrganization}
位置：${flag} ${j.countryCode} ${j.city}
属性：${nativeText} ${bbbb}
系数：${riskText}`,
    icon: risk >= 90 ? "exclamationmark.triangle.fill" : "leaf.fill",
    'title-color': titleColor // 应用自定义颜色
  })
})

function maskIP(ip) {
  if (!ip) return ''
  // IPv4
  if (ip.includes('.')) {
    const p = ip.split('.')
    return `${p[0]}.${p[1]}.*.*`
  }
  // IPv6
  const p6 = ip.split(':')
  return `${p6[0]}:${p6[1]}:*:*:*:*:*:*`
}

function flagEmoji(code) {
  if (code.toUpperCase() === "TW") code = "CN"
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt())
  )
}
