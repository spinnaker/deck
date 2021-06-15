if [ ! -e "/etc/redhat-release" ]; then
  user=www-data
  group=$user
  app=apache2

  apt-get update
  apt-get install $app -y
  service $app stop
  a2enmod proxy proxy_ajp proxy_http rewrite deflate headers proxy_balancer proxy_connect proxy_html xml2enc
else
  user=apache
  group=$user
  app=httpd

  yum update
  maj=$(cat /etc/system-release-cpe | awk -F: '{ print $5 }' | awk -F. '{ print $1 }')
  if [ "$maj" == "7" ];then
    prep="httpd24-"
  else
    prep=""
  fi
  yum install -y ${prep}mod_proxy_html mod_ssl $app
fi

chown -R $user:$group /etc/$app
for dir in /var/lib /var/run /var/log;
do
   mkdir -p $dir/$app
  chown -R $user:$group $dir/$app
done

