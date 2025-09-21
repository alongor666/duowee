#!/bin/bash

echo "🚀 车险多维分析系统启动脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js (版本 18.17 或更高)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
    echo "❌ 错误: Node.js版本过低 (当前: $NODE_VERSION, 需要: $REQUIRED_VERSION 或更高)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $NODE_VERSION"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖包安装失败"
        exit 1
    fi
    echo "✅ 依赖包安装完成"
else
    echo "✅ 依赖包已存在"
fi

# 检查数据文件
if [ ! -f "public/data/metadata/data_catalog.json" ]; then
    echo "⚠️  注意: 未找到预置数据文件"
    echo "系统将以空数据状态启动，您可以通过界面导入CSV数据文件"
else
    echo "✅ 数据文件检查通过"
fi

# 构建项目（可选）
read -p "是否需要先构建项目？(y/N): " BUILD_CHOICE
if [[ $BUILD_CHOICE =~ ^[Yy]$ ]]; then
    echo "🔨 正在构建项目..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 项目构建失败"
        exit 1
    fi
    echo "✅ 项目构建完成"
fi

# 启动开发服务器
echo "🌟 正在启动开发服务器..."
echo ""
echo "🌐 访问地址: http://localhost:3000"
echo "📊 功能特性:"
echo "   • 4×4 KPI看板矩阵展示"
echo "   • 智能CSV数据导入"
echo "   • 多维度筛选分析"
echo "   • 同比/环比对比"
echo ""
echo "💡 使用提示:"
echo "   1. 点击页面右上角'导入数据'按钮"
echo "   2. 下载标准模板或使用测试数据.csv"
echo "   3. 拖拽或选择CSV文件进行导入"
echo ""
echo "⏹️  按 Ctrl+C 停止服务器"
echo "================================"

npm run dev