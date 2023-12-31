# ⚙️ 浅塘计算器

 - “浅塘”是一款TTZGame开发的益智游戏。
 - 浅塘计算器是用于计算浅塘关卡答案的计算器。



# 介绍

 - 算法经过精心设计与优化，最复杂题目的最短路径求解被控制在约70毫秒。
 - 具体使用说明见网页页面。

# 部署

 - 建议使用VSCode插件 _Live Server_。
 - FireFox浏览器对部分CSS API的实现问题会导致内容无法正确显示。

# API

**注意：** 所有API均需在浏览器控制台中运行。

## load_pond([index])

从示例关卡中选择加载并显示。
 - `index` : 示例关卡id，默认值为0。

## print_pond()

在控制台输出当前关卡编码字符串。

## copy_pond(pond)

加载字符串中的关卡。

 - `pond` ： 关卡编码字符串。

## solve_pond_test([round])

计算关卡答案并计算平均用时。

 - `round` ：测试轮数，默认值为5。

## load_and_test([index] [, round])

加载示例关卡并测试用时。

 - `index` ：示例关卡id，默认值为0。
 - `round` ：测试轮数，默认值为5。
