convert aab to apks
---
* creat keystore
$ keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
---
* aab to apks
 $ java -jar bundletool.jar build-apks --bundle=suno.aab --output=my-app.apks --ks=suno.keystore --ks-pass=pass:123456 --ks-key-alias=my-key-alias --key-pass=pass:123456 --mode=universal

---
* apks to apk
 $ java -jar bundletool.jar extract-apks --apks=my-app.apks --output-dir=my-app-apk-files
