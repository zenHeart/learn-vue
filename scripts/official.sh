#!/bin/bash

server_path="examples/${1}/official/server.js";

# 定义环境监听端口为 8081
export PORT=8081;
node ${server_path};