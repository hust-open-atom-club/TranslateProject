---
status: collected
title: "Free the Last Thing Style"
author: Dan Carpenter
collector: Athanlaich
collected_date: 20250715
translator: Athanlaich
translated_date: 20250720
link: https://staticthinking.wordpress.com/2022/04/28/free-the-last-thing-style/
---

# 释放最后对象风格

上个月，一位著名的建筑师 Christopher Alexander 去世了。他意识到一个现象：优秀的建筑往往会被模仿，而糟糕的建筑则会被拆除。因此，他研究古老的建筑，试图找出优秀建筑共有的模式。他创造了“模式语言”（pattern language）这个术语来描述那些被模仿的优秀模式。我不知道 Christopher Alexander 是否讨论过反面模式（anti-patterns），但反面模式指的是那些本身很糟糕、却仍被人们反复模仿的想法。

内核中存在多种错误处理风格。这些都不是我发明的，我像 Christopher Alexander 一样，只是研究那些已经存在的东西。我只是起了个名字。

有一种风格叫“单一错误处理风格”（One Err Style）。这是最糟糕、最容易出错的风格。它有一个子风格，称为“单一清理函数风格”（One Cleanup Function Style）。这简直是糟糕透顶！另一种是“设备模型”（Device Model），即当你使用 `register_device()`  时的模型。大概一两年后，等我更好地理解它后，明白它在什么情况下有效、在什么情况下失效时，我会写点相关的东西。但最常见的错误处理风格是“释放最后对象风格”（Free the Last Thing Style）。人们使用这种风格是因为它最容易编写且错误最少。

释放最后对象风格看起来像这样：

```
	a = alloc();
	if (!a)
		return -ENOMEM;

	b = alloc();
	if (!b) {
		ret = -ENOMEM;
		goto free_a;
	}

	c = alloc();
	if (!c) {
		ret = -ENOMEM;
		goto free_b;
	}

	return 0;

free_b:
	free(b);
free_a:
	free(a);
	
	return ret;
```

释放最后对象风格的规则是：

1) 在脑海中跟踪最近一次**成功**的分配。

2) 选择一个能说明 `goto` 操作的标签名称。这个名称应该让读者一眼就能看出你正在释放最近分配的对象。

3) 释放的顺序与分配的顺序相反/镜像。

4) 分配代码中的任何条件都应在释放代码中有对应的体现。

5) 每个函数必须清理它自己部分分配的资源。

6) 每个分配函数必须有一个匹配的释放函数。

这种风格的一个优点是，你可以轻松创建一个释放函数。只需复制粘贴错误处理代码，添加一个 `free(c);`，删除标签，就完成了。

```
void free_function()
{
	free(c);
	free(b);
	free(a);
}
```

这种错误处理风格易于编写，因为你不需要记住每一次分配，只需记住最近的一次。它易于审计，因为标签名称告诉你要释放哪个分配的对象，这样你无需滚动到函数底部就能判断其正确性。它也易于更新。

在其他风格中，常见的错误是释放了未分配的对象。在这种风格中，我们只释放已分配的对象。在其他风格中，你必须跟踪每一次分配，很容易遗漏某一个；而在这种风格中，你只需记住最近的一次分配，这非常简单。

有些人认为错误处理代码和释放函数是重复的，占用了太多行代码。但实际上，如果你试图使用“单一清理函数风格”来合并它们，就必须添加一堆 `if` 语句，最终使用的代码行数是一样的。那种风格要复杂得多，而且总是充满错误。

人们常做的另一件事是为第一个分配失败使用一个空操作 `goto`。这会损害可读性，并可能导致忘记设置错误码的错误。此外，`goto out;` 这种标签含糊不清且毫无意义。

第三个陷阱是，人们有时使用“来源标签”（Come From label names）。这种标签名称说明 `goto` 语句从哪里来，而不是说明它要做什么。

```
if (not_valid(p))
	goto p_invalid;
```

“来源标签”是无用的，因为从 `if` 语句我们已经知道 `p` 无效。下一个失败路径也可能 `goto p_invalid;`，这比无用更糟糕，因为它会主动地误导。有时你会看到多个 `goto p_invalid;` 语句，然后未来的开发者删除了变量 `p`。那些 `goto p_invalid` 语句仍然存在，但变量 `p` 却消失了。这被称为 [Hyperart Thomasson](https://en.wikipedia.org/wiki/Hyperart_Thomasson) 。它是一个美丽而令人费解的历史代码遗迹。

一个罕见的反面模式是，人们使用 GW-Basic 风格的编号标签，如 err0, err1, err2 等。这种模式不常见，但值得一提，因为它非常滑稽。编号缺失的错误标签也是一种 Hyperart Thomasson。

从循环中解绑稍微复杂一些。首先在 `goto` 之前清理部分分配的资源，然后使用类似 `while (–i >= 0)` 的语句进行解绑。

```
	for (i = 0; i < 10; i++) {
		x = alloc();
		if (!x) {
			ret = -ENOMEM;
			goto unwind_loop;
		}
	
		y = alloc();
		if (!y) {
			free(x);
			ret = -ENOMEM;
			goto unwind_loop;
		}
	
		z = alloc();
		if (!z) {
			free(y);
			free(x);
			goto unwind_loop;
		}
	}

	return 0;
	
unwind_loop:
	while (--i >= 0) {
		free(z);
		free(y);
		free(x);
	}
	
	return ret;
```

最后一点是，有时人们会让最后一次分配的处理方式与众不同。例如，每个 if 语句都是 `if (ret) {`，然后对于最后一个 if 语句，他们会写成 `if (!ret) {`。我不知道人们为什么这样做，但不要屈服于这种诱惑。

编程愉快！ 
