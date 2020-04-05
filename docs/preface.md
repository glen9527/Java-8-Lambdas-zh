# 前言

> Preface

For years, functional programming has been considered the realm of a small band of specialists who consistently claimed superiority to the masses while being unable to spread the wisdom of their approach. The main reason I’ve written this book is to challenge both the idea that there’s an innate superiority in the functional style and the belief that its approach should be relegated to a small band of specialists!

For the last two years in the London Java Community, I’ve been getting developers to try out Java 8 in some form or another. I’ve found that many of our members enjoy the new idioms and libraries that it makes available to them. They may reel at the terminology and elitism, but they love the benefits that a bit of simple functional programming provides to them. A common thread is how much easier it is to read code using the new Streams API to manipulate objects and collections, such as filtering out albums that were made in the UK from a List of all albums.

What I’ve learned when running these kinds of events is that examples matter. People learn by repeatedly digesting simple examples and developing an understanding of patterns out of them. I’ve also noticed that terminology can be very off-putting, so anytime there’s a hard-sounding concept, I give an easy-to-read explanation.

For many people, what Java 8 offers by way of functional programming is incredibly limited: no monads,[1] no language-level lazy evaluation, no additional support for immutability. As pragmatic programmers, this is fine; what we want is the ability to write library-level abstractions so we can write simple, clean code that solves business problems. We’re even happier if someone else has written these libraries for us and we can just focus on doing our daily jobs.

## Why Should I Read This Book?

In this book we’ll explore:

- How to write simpler, cleaner, and easier-to-read code—especially around collections
- How to easily use parallelism to improve performance
- How to model your domain more accurately and build better DSLs
- How to write less error-prone and simpler concurrent code
- How to test and debug your lambda expressions

Developer productivity isn’t the only reason why lambda expressions have been added to Java; there are fundamental forces in our industry at work here as well.

## Who Should Read This Book?

This book is aimed squarely at Java developers who already have core Java SE skills and want to get up to speed on the big changes in Java 8.

If you’re interested in reading about lambda expressions and how they can improve your lot as a professional developer, read on! I don’t assume you know about lambda expressions themselves, or any of the core library changes; instead, I introduce concepts, libraries, and techniques from scratch.

Although I would love for every developer who has ever lived to go and buy this book, realistically, it’s not appropriate for everyone. If you don’t know any Java at all, this isn’t the book for you. At the same time, though lambda expressions in Java are very well covered here, I don’t explain how they are used in any other languages.

I don’t provide a basic introduction to the use of several facets of the Java SE, such as collections, anonymous inner classes, or the event handling mechanism in Swing. I assume that you already know about all of these elements.

## How to Read This Book

This book is written in an example-driven style: very soon after a concept is introduced, you’ll see some code. Occasionally you might see something in the code that you’re not 100% familar with. Don’t worry—it’ll be explained very soon afterward, frequently in the next paragraph.

This approach also lets you try out the ideas as you go along. In fact, at the end of most chapters there are further examples for you to practice on your own. I highly recommend that you try doing these katas as you get to the end of the chapter. Practice makes perfect, and—as every pragmatic programmer knows—it’s really easy to fool yourself into thinking that you understand some code when in reality you’ve missed a detail.

Because the use of lambda expressions is all about abstracting complexity away into libraries, I introduce a bunch of common library niceties as I go along. Chapters 2 through 6 cover the core language changes and also the improved libraries that JDK 8 brings.

The final three chapters are about applying functional programming in the wild. I’ll talk about a few tricks that make testing and debugging code a bit easier in Chapter 7. Chapter 8 explains how existing principles of good software design also apply to lambda expressions. Then I talk about concurrency and how to use lambda expressions to write concurrent code that’s easy to understand and maintain in Chapter 9. These chapters also introduce third-party libraries, where relevant.

It’s probably worth thinking of the opening four chapters as the introductory material—things that everyone will need to know to use Java 8 properly. The latter chapters are more complex, but they also teach you how to be a more complete programmer who can confidently use lambda expressions in your own designs. There are also exercises as you go along, and the answers to these can be found on GitHub. If you practice the exercises as you go along, you’ll soon master lambda expressions.
