#docker build -t gitlab.inmagik.com:4443/inmagik/images/pdf-puppet-dev .
#docker push gitlab.inmagik.com:4443/inmagik/images/pdf-puppet-dev

docker build -t registry.inmagik.com/pdf-puppet/pdf-puppet:edge .
docker push registry.inmagik.com/pdf-puppet/pdf-puppet:edge