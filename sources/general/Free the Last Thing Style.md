---
status: collected
title: "Free the Last Thing Style"
author: Dan Carpenter
collector: Athanlaich
collected_date: 20250715
link: https://staticthinking.wordpress.com/2022/04/28/free-the-last-thing-style/
---

# Free the Last Thing Style

There was a famous architect Christopher Alexander who passed away last month. One thing he realized is that buildings which are good tend to be copied and buildings which are bad tend to be crushed. So he looked at old buildings and tried to spot patterns that the good buildings had in common. He coined the term “pattern language” to describe the good patterns which are copied. I don’t know if Christopher Alexander talked about anti-patterns but those are ideas which are bad and people still copy them over and over anyway.

In the kernel, there are different styles of error handling. I didn’t invent any of these, I’m like Christopher Alexander studying things which already exist. I just made up the names.

There is One Err Style. This is the worst, most bug prone style. There is a sub style of One Err Style called One Cleanup Function Style. This is the worst of the worst! Then is the Device Model which is when you use register\_device(). I’ll probably write something about this in a year or two when I understand it better; where it works and where it breaks down. But the most common style of error handling is Free the Last Thing Style. People use this style because it is the easiest to write and has the fewest bugs.

Free the Last Thing Style looks like this:

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

The rules for Free the Last Thing Style are:

1) Keep track in your head of the most recent **successful** allocation.

2) Choose a label name which says what the goto does. It should be obvious to the reader that you are freeing the most recent allocation.

3) The frees are in mirror/reverse order from the allocations.

4) Any conditions in the allocation code should be mirrored in the free code.

5) Every function must clean up its own partial allocations.

6) Every allocation function must have a matching free function.

One of the advantages of this style is that you can easily create a free function. Just copy and paste the error handling. Add a free(c). Delete the labels. Done.

```
void free_function()
{
	free(c);
	free(b);
	free(a);
}
```

This style of error handling is easy to write because you don’t have to remember every allocation, you only have to remember the most recent one. It is easy to audit because the label names tell you which allocation is freed so you can see that it is correct without scrolling to the bottom of the function. It is easy to update.

In the other styles the common kind of bug is freeing something which was not allocated. In this style we only free allocated things. In the other styles you have to track every allocation so it’s easy to forget one, but in this style you only have to remember the most recent allocation which is simple.

Some people think the error handling and the free function are duplicative and take too many lines of code. But actually if you try to combine them using One Cleanup Function Style then you have to add a bunch of if statements so it ends up using the same lines of code. That style is way more complicated and invariably buggy.

Another thing that people do is use a do-nothing goto for the first allocation failure. This hurts readability and can lead to Forgot to Set the Error Code bugs. Plus “goto out;” is vague and meaningless.

A third pitfall is that people sometimes use Come From label names. These are label names which say where the goto is and not what it does.

```
if (not_valid(p))
	goto p_invalid;
```

Come From label names are useless because we already know that p is invalid from the if statement. The next failure path might also “goto p\_invalid;” which is even worse than useless because it’s actively misleading. Sometimes you will have several “goto p\_invalid;” statements and then a future developer deletes the “p” variable. The “goto p\_invalid” statements are still there but “p” variable is gone. This is called a [Hyperart Thomasson](https://en.wikipedia.org/wiki/Hyperart_Thomasson). It is a beautiful puzzling historical code artifact.

A rare anti-pattern is when people use GW-Basic style numbered labels like err0, err1, err2 etc. This pattern is not common but it’s worth mentioning because it’s so amusing. Numbered error labels with numbers missing is also a Hyperart Thomasson.

Unwinding from loops is slightly complicated. First cleanup up partial allocations before the goto. Then unwind with something like while (–i >= 0).

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

The final thing is that sometimes people will make the last allocation different. For example, every if statement will be “if (ret) {” and then for the final if statement they will do “if (!ret) {“. I don’t know why people do this, but don’t give in to temptation.


Happy Hacking!