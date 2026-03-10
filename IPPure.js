/*
 * IPPure 节点 IP 纯净度
 */

const url = "https://my.ippure.com/v1/info"
const MarkIP = ($argument || 'false').toLowerCase() === 'true'

$httpClient.get(url, (err, resp, data) => {
  if (err) {
    $done({ title: "IP 纯净度", content: "请求失败", icon: "network.slash" })
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

  if (risk >= 80) {
    riskText = `极高风险 ( ${risk} )`
    titleColor = "#FF3B30"
  } else if (risk >= 70) {
    riskText = `高风险 ( ${risk} )`
    titleColor = "#FF9500"
  } else if (risk >= 40) {
    riskText = `中等风险 ( ${risk} )`
    titleColor = "#FFCC00"
  } else {
    riskText = `低风险 ( ${risk} )`
    titleColor = "#34C759"
  }

  $done({
    title: "IPPure",
    content:
`${ipLabel}：${showIP}
ASN：AS${j.asn} ${j.asOrganization}
位置：${flag} ${j.countryCode} ${j.city}
属性：${nativeText} ${bbbb}
系数：${riskText}`,
    
    icon: risk >= 70 ? "exclamationmark.triangle.fill" : "leaf.fill",
    'title-color': titleColor
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