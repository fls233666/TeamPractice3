# README

## 测试链接

[Nginx主页(http://47.96.191.232:80)](http://47.96.191.232:80)

[OpenAPI文档(http://47.96.191.232:8080/doc.html#/home)](http://47.96.191.232:8080/doc.html#/home)

[API接口调用-基地址(http://47.96.191.232:80/api)](http://47.96.191.232:80/api)

[API接口调用-测试-回声服务器(http://47.96.191.232:80/api/hello/echo/URL上的回声文本)](http://47.96.191.232:80/api/hello/echo/URL上的回声文本)

[Controller文件夹下是有关API的内容](src/main/java/com/harvey/se/controller)

## 部署环境

阿里云Centos-7

采用Docker部署, 下面是DOCKERFILE

```dockerfile
FROM openjdk:11.0-jre-buster
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY "./target/se-demo.jar" "/app.jar"

ENTRYPOINT ["java","-jar","/app.jar","--spring.profiles.active=local"]
```

## 依赖

- Mysql 8.0.27
- Redis 5.x
- openJDK 11


