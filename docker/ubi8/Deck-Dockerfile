FROM registry.access.redhat.com/ubi8/ubi:8.3
MAINTAINER sig-platform@spinnaker.io
LABEL name='deck'
LABEL maintainer='info@opsmx.io'
LABEL release=2
LABEL version='1.21.1'
LABEL summary='Red Hat certified Open Enterprise Spinnaker ubi8 container image for deck'
LABEL description='Certified Open Enterprise Spinnaker is an Enterprise grade, Red Hat certified and OpsMx supported release of the popular and critically acclaimed Continuous Delivery platform Spinnaker'
LABEL vendor='OpsMx'
WORKDIR /opt/deck
RUN yum -y install java-11-openjdk-headless.x86_64 wget vim  net-tools curl nettle
RUN yum -y update
COPY docker        /opt/deck/docker
COPY docker/run-apache2.sh docker/run-apache2.sh
COPY docker/setup-apache2.sh docker/setup-apache2.sh
RUN chmod -R 777 docker/setup-apache2.sh
RUN docker/setup-apache2.sh
COPY build/webpack /opt/deck/html
RUN chown -R apache:apache /opt/deck



USER root

RUN chown -Rf apache:root /var/log/httpd && chmod -Rf 775 /var/log/httpd
RUN chgrp -Rf root /var/lib && chmod -Rf g+w /var/lib
RUN chgrp -Rf root /etc/httpd && chmod -Rf g+w /etc/httpd
RUN chgrp -Rf root /opt/deck && chmod -Rf g+w /opt/deck
RUN chgrp -Rf root /var/lock && chmod -Rf g+w /var/lock
RUN chgrp -Rf root /run/lock && chmod -Rf g+w /run/lock
RUN chown -Rf apache:root /var/run/httpd && chmod -Rf 775 /var/run/httpd
RUN chmod g+w /etc/passwd

USER apache

CMD docker/run-apache2.sh
