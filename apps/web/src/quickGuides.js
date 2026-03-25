export const TEMPLATE_STENDERS_QI = 'stenders_qi';

export const quickGuides = [
  {
    id: 'openclaw-install',
    title: 'OpenClaw 安装',
    summary: 'Windows 单机快速安装 OpenClaw 与常见问题处理。',
    level: '入门',
    content: `一、下载准备\n1. 访问 OpenClaw 官方发布页下载最新安装包。\n2. 解压到英文目录，例如 D:\\Tools\\OpenClaw。\n\n二、运行安装\n1. 右键安装程序，选择“以管理员身份运行”。\n2. 按默认选项安装，确保勾选“Add to PATH”。\n\n三、验证安装\n1. 打开终端执行：openclaw --version\n2. 正常返回版本号即安装完成。\n\n四、常见问题\n1. 提示找不到命令：重开终端，或手动把安装目录加入系统 PATH。\n2. 启动闪退：安装 VC++ 运行库后重试。`
  },
  {
    id: 'printer-install',
    title: '打印机配置安装',
    summary: '局域网打印机添加、驱动安装、共享打印一步到位。',
    level: '常用',
    content: `一、确认网络\n1. 打印机和电脑连接同一局域网。\n2. 打印测试页确认打印机 IP。\n\n二、Windows 添加打印机\n1. 设置 -> 蓝牙和其他设备 -> 打印机和扫描仪。\n2. 选择“手动添加”，输入打印机 IP。\n3. 选择对应驱动（无驱动时安装厂商驱动包）。\n\n三、共享配置\n1. 控制面板 -> 设备和打印机 -> 打印机属性。\n2. 开启“共享这台打印机”。\n\n四、故障排查\n1. 打印队列卡住：清空队列并重启 Print Spooler。\n2. 打印乱码：更换驱动为 PCL6 或 PS 驱动。`
  },
  {
    id: 'wifi-password',
    title: '无线 WiFi 密码查看',
    summary: '快速查看当前/历史 WiFi 密码（仅限授权设备）。',
    level: '速查',
    content: `一、查看当前连接密码（Windows）\n1. 打开命令提示符（管理员）。\n2. 执行：netsh wlan show profiles\n3. 执行：netsh wlan show profile name="你的WiFi名" key=clear\n4. 在“关键内容”字段查看密码。\n\n二、注意事项\n1. 仅用于公司授权设备运维。\n2. 禁止传播到非授权人员。`
  },
  {
    id: 'one-click-help',
    title: '一键求助',
    summary: '故障发生后，1 分钟内把关键诊断信息发给 IT。',
    level: '应急',
    content: `一、适用场景\n1. 电脑卡顿、联网失败、软件打不开、打印异常。\n\n二、一键求助标准动作\n1. 截图报错界面。\n2. 记录发生时间与操作步骤。\n3. 执行公司“一键诊断脚本”（如 help.bat）。\n4. 将日志和截图发到 IT 支持群。\n\n三、上报模板\n1. 设备名：\n2. 时间：\n3. 现象：\n4. 是否可复现：\n5. 附件：截图 + 日志`
  },
  {
    id: 'ai-troubleshooting',
    title: 'AI排障',
    summary: '用 AI 辅助分析报错日志、定位根因并生成修复步骤。',
    level: '进阶',
    content: `一、准备信息\n1. 收集错误日志、截图、复现步骤。\n2. 记录系统环境：系统版本、软件版本、网络环境。\n\n二、AI 排障流程\n1. 将报错信息粘贴给 AI，要求先“解释错误含义”。\n2. 让 AI 输出“可能根因 Top 3”。\n3. 让 AI 给出“可执行排查命令”和“预期结果”。\n4. 按步骤执行后，把结果回传给 AI 继续收敛。\n\n三、标准提问模板\n1. 现象：xxx\n2. 报错：xxx\n3. 我已尝试：xxx\n4. 请给我：最可能原因 + 逐步修复命令 + 回滚方案\n\n四、注意事项\n1. 敏感数据先脱敏再上传。\n2. 高风险操作先在测试环境验证。`
  }
];

export function getQuickGuide(id) {
  return quickGuides.find((item) => item.id === id);
}

