# Set any missing env variables used to configure deck

_DECK_HOST=$DECK_HOST
_DECK_PORT=$DECK_PORT
_API_HOST=$API_HOST
_DECK_CERT_PATH=$DECK_CERT
_DECK_KEY_PATH=$DECK_KEY
_PASSPHRASE=$PASSPHRASE

if [ ! -e "/etc/redhat-release" ]; then
    dir=apache2
    sites=/etc/$dir/sites-available
    conf=/etc/$dir
    a2=true
else
    dir=httpd
    sites=/etc/$dir/conf.d
    conf=/etc/$dir/conf.d
    a2=false
fi

if [ -z "$_DECK_HOST" ];
then
    _DECK_HOST=0.0.0.0
fi

if [ -z "$_DECK_PORT" ];
then
    _DECK_PORT=9000
fi

if [ -z "$_API_HOST" ];
then
    _API_HOST=http://localhost:8084
fi

if [ -z "$_DECK_CERT_PATH" ];
then
  cp docker/spinnaker.conf.gen spinnaker.conf
  # remove ssl config, httpd doesn't start without certs
  if [ -e "/etc/redhat-release" ]; then
    rm $conf/ssl.conf
  fi
else
  if [ ! -e "/etc/redhat-release" ]; then
    a2enmod ssl
  fi
  # on RHEL it's enabled through config
  rm $conf/ssl.conf
  cp docker/spinnaker.conf.ssl spinnaker.conf
  sed -ie 's|{%DECK_CERT_PATH%}|'$_DECK_CERT_PATH'|g' spinnaker.conf
  sed -ie 's|{%DECK_KEY_PATH%}|'$_DECK_KEY_PATH'|g' spinnaker.conf
fi

# Generate spinnaker.conf site & enable it

sed -ie 's|{%DECK_HOST%}|'$_DECK_HOST'|g' spinnaker.conf
sed -ie 's|{%DECK_PORT%}|'$_DECK_PORT'|g' spinnaker.conf
sed -ie 's|{%API_HOST%}|'$_API_HOST'|g' spinnaker.conf

mkdir -p $sites
mv spinnaker.conf $sites

if [ "a2" == "true" ]; then
  a2ensite spinnaker
fi

# Update ports.conf to reflect desired deck host

cp docker/ports.conf.gen ports.conf

sed -ie "s|{%DECK_HOST%}|$_DECK_HOST|g" ports.conf
sed -ie "s|{%DECK_PORT%}|$_DECK_PORT|g" ports.conf
sed -ie "s|apache2|$dir|g" ports.conf
mv ports.conf $conf/ports.conf

# Create a passphrase file to inject the SSL passphrase into apache's startup

cp docker/passphrase.gen passphrase

sed -ie "s|{%PASSPHRASE%}|$_PASSPHRASE|g" passphrase

# Clear password from env vars

_PASSPHRASE=""
PASSPHRASE=""

chmod +x passphrase
mv passphrase /etc/$dir/passphrase

if [ -e /opt/spinnaker/config/settings.js ];
then
        cp /opt/spinnaker/config/settings.js /opt/deck/html/settings.js
fi

if [ -e /opt/spinnaker/config/settings-local.js ];
then
        cp /opt/spinnaker/config/settings-local.js /opt/deck/html/settings-local.js
fi

if [ ! -e "/etc/redhat-release" ]; then
  apache2ctl -D FOREGROUND
else
  sed -ie "s|Listen 80|#Listen 80|" /etc/httpd/conf/httpd.conf
  exec /usr/sbin/apachectl -DFOREGROUND
fi
