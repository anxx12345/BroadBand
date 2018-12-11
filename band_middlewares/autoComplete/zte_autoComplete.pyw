import telnetlib
import time
import re
def do_telnet(Host,port,user_vlan,net_svlan,iptv_svlan):
    username = ''   # 登录用户名
    password = ''  # 登录密码
    finish = '#'      # 命令提示符
    cmd_show_run = 'show running-config interface gpon-onu_'
    cmd_show_onu_run='show onu running config gpon-onu_'
    #连接前生成命令行
    data_cmd0 = 'interface gpon-onu_' + port#添加端口
    data_cmd = [data_cmd0]
    data_cmd.append('sn-bind disable')
    data_cmd.append('tcont 1 name Tl1DefaultCreate profile default')
    data_cmd.append('gemport 1 name Tl1DefaultCreate unicast tcont 1 dir both')
    data_cmd.append('switchport mode hybrid vport 1')
    data_cmd.append('service-port 1 vport 1 user-vlan 999 vlan 999')
    data_cmd.append('service-port 1 description INTERNET')
    data_cmd7 = 'service-port 2 vport 1 user-vlan' + user_vlan + ' vlan' + user_vlan + ' svlan ' + net_svlan#上网数据1
    data_cmd.append(data_cmd7)
    data_cmd.append('service-port 2 description INTERNET')
    data_cmd.append('service-port 3 vport 1 user-vlan 47 vlan 47')
    data_cmd.append('service-port 3 description VOIP')
    data_cmd11 = 'service-port 4 vport 1 user-vlan 282 vlan 282 svlan ' + iptv_svlan#iptv数据1
    data_cmd.append(data_cmd11)
    data_cmd.append('service-port 4 description IPTV')#data_cmd12
    data_cmd13='pon-onu-mng gpon-onu_'+port#添加port口
    data_cmd.append(data_cmd13)
    data_cmd.append('service TR069 gemport 1 vlan 999')
    data_cmd15='service INTERNET gemport 1 vlan '+user_vlan #上网数据2
    data_cmd.append(data_cmd15)
    data_cmd.append('service VOIP gemport 1 vlan 47')
    data_cmd.append('service IPTV gemport 1 vlan 282')#IPTV数据2
    data_cmd.append('switchport-bind switch_0/1 veip 1')
    data_cmd19='vlan port eth_0/1 mode tag vlan '+user_vlan #上网数据3
    data_cmd.append(data_cmd19)
    data_cmd.append('vlan-filter-mode veip 1 tag-filter vid-filter untag-filter transparent')
    data_cmd.append('vlan-filter veip 1 priority 0 vid 47')
    data_cmd.append('vlan-filter veip 1 priority 0 vid 282') #IPTV数据3
    data_cmd.append('vlan-filter veip 1 priority 0 vid 999')
    data_cmd24='vlan-filter veip 1 priority 0 vid '+user_vlan
    data_cmd.append(data_cmd24)  #命令行完成
    i=0
    for i in range(0,len(data_cmd)):
        print(data_cmd[i])
        i=i+ 1
    # 连接Telnet olt
    tn = telnetlib.Telnet(Host, port=23, timeout=30)
    tn.set_debuglevel(2)    # 输入登录用户名1
    tn.read_until(b'Username:')
    tn.write(username.encode('ascii') + b'\n')
    # 输入登录密码
    tn.read_until(b'Password:')
    tn.write(password.encode('ascii') +b'\n')
    # 登录完毕后执行查询命令
    tn.read_until(finish.encode('ascii'))
    cmd_show_run=cmd_show_run+port
    tn.write(cmd_show_run.encode('ascii')+b"\n")
    time.sleep(0.5)
    cmd_show_onu_run=cmd_show_onu_run+port
    tn.write(cmd_show_onu_run.encode('ascii')+b"\n")
    time.sleep(0.5)
    tn.write(b' ')
    rst_cmd = tn.read_very_eager()
    rst_cmds=rst_cmd.decode(encoding='utf-8')
    rst_cmds = rst_cmds.replace('\r', "")
    #匹配出关键命令行数据
    rst_net_cmd1=re.findall('service-port 2.*%s.*vlan.*%s|.*svlan.*%s'%(user_vlan,user_vlan,net_svlan),rst_cmds ,re.M )
    rst_net_cmd2=re.findall('service-port.*vlan.*%s|.*mode tag vlan.*%s|.*vid.*%s'%(user_vlan,user_vlan,user_vlan),rst_cmds ,re.M )
    rst_iptv=re.findall('service-port 4.*%s|.*IPTV.*gemport.*282|.*vlan-filter.*vid.*282'%(iptv_svlan),rst_cmds ,re.M )
    rst_net_cmd=rst_net_cmd1+rst_net_cmd2
    rst_net_cmd=str(rst_net_cmd)
    rst_iptv=str(rst_iptv)
    print(rst_net_cmd)
    print(rst_iptv)
    #数据是否成功标志
    data_flag=False
    net_data_flag=net_svlan in rst_net_cmd.split(',')[0] and user_vlan in rst_net_cmd.split(',')[1] and user_vlan in rst_net_cmd.split(',')[2] and user_vlan in rst_net_cmd.split(',')[3]
    iptv_data_flag=iptv_svlan in rst_iptv.split(',')[0] and '282' in rst_iptv.split(',')[1] and '282' in rst_iptv.split(',')[2]
    if net_data_flag:
        if iptv_data_flag:
            print("上网及iptv数据正常！")
            data_flag=True
            mac_file = open('./test/zte_xiedata_201805310843.txt', 'a')
            mac_file.write(Host+' ,'+port+' ,'+user_vlan+' ,'+net_svlan+' ,'+iptv_svlan+"上网及iptv数据正常！"+'\n')
            mac_file.close()
        else:
            print("上网数据正常，但iptv数据不正常！")
            data_flag=False
            mac_file = open('./test/zte_xiedata_201805310843.txt', 'a')
            mac_file.write(Host+' ,'+port+' ,'+user_vlan+' ,'+net_svlan+' ,'+iptv_svlan+"上网数据正常，但iptv数据不正常！"+'\n')
            mac_file.close()
    else:
        if iptv_data_flag:
            print("上网数据不完整,iptv数据正常!")
            data_flag=False
            mac_file = open('./test/zte_xiedata_201805310843.txt', 'a')
            mac_file.write(Host + ' ,' + port + ' ,' + user_vlan + ' ,' + net_svlan + ' ,' + iptv_svlan + "上网数据不完整,iptv数据正常!" + '\n')
            mac_file.close()
        else:
            print("上网及iptv数据均不完整!")
            data_flag=False
            mac_file = open('./test/zte_xiedata_201805310843.txt', 'a')
            mac_file.write(Host + ' ,' + port + ' ,' + user_vlan + ' ,' + net_svlan + ' ,' + iptv_svlan + "上网及iptv数据均不完整！" + '\n')
            mac_file.close()
    if data_flag:
        tn.close()
    else:
        i=0
        for i in range(0,len(data_cmd)):
            tn.write(data_cmd[i].encode('ascii')+'\n')
            i=i+1
        tn.close()
if __name__=='__main__':
     # 配置选项.
    Host = '10.10.104.10' # Telnet服务器IP
    port='1/2/1:3 '
    user_vlan='1004'
    net_svlan='3111'
    iptv_svlan='4052'
    do_telnet(Host,port,user_vlan,net_svlan,iptv_svlan)