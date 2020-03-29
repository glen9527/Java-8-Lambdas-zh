# 第 1 章 简介

> Chapter 1. Introduction

Before we begin our exploration of what lambda expressions are and how we can use them, you should at least understand why they exist to begin with. In this chapter, I’ll cover that and also explain the structure and motivation of this book.

Why Did They Need to Change Java Again?
Java 1.0 was released in January 1996, and the world of programming has changed quite a bit since then. Businesses are requiring ever more complex applications, and most programs are executed on machines with powerful multicore CPUs. The rise of Java Virtual Machines (JVM), with efficient runtime compilers has meant that programmers can focus more on writing clean, maintainable code, rather than on code that’s efficiently using every CPU clock cycle and every byte of memory.

The elephant in the room is the rise of multicore CPUs. Programming algorithms involving locks is error-prone and time-consuming. The java.util.concurrent package and the wealth of external libraries have developed a variety of concurrency abstractions that begin to help programmers write code that performs well on multicore CPUs. Unfortunately, we haven’t gone far enough—until now.

There are limits to the level of abstractions that library writers can use in Java today. A good example of this is the lack of efficient parallel operations over large collections of data. Java 8 allows you to write complex collection-processing algorithms, and simply by changing a single method call you can efficiently execute this code on multicore CPUs. In order to enable writing of these kinds of bulk data parallel libraries, however, Java needed a new language change: lambda expressions.

Of course there’s a cost, in that you must learn to write and read lambda-enabled code, but it’s a good trade-off. It’s easier for programmers to learn a small amount of new syntax and a few new idioms than to have to handwrite a large quantity of complex thread-safe code. Good libraries and frameworks have significantly reduced the cost and time associated with developing enterprise business applications, and any barrier to developing easy-to-use and efficient libraries should be removed.

Abstraction is a concept that is familiar to us all from object-oriented programming. The difference is that object-oriented programming is mostly about abstracting over data, while functional programming is mostly about abstracting over behavior. The real world has both of these things, and so do our programs, so we can and should learn from both influences.

There are other benefits to this new abstraction as well. For many of us who aren’t writing performance-critical code all the time, these are more important wins. You can write easier-to-read code—code that spends time expressing the intent of its business logic rather than the mechanics of how it’s achieved. Easier-to-read code is also easier to maintain, more reliable, and less error-prone.

You don’t need to deal with the verbosity and readbility issues surrounding anonymous inner classes when writing callbacks and event handlers. This approach allows programmers to work on event processing systems more easily. Being able to pass functions around easily also makes it easier to write lazy code that initializes values only when necessary.

In addition, the language changes that enable the additional collection methods, default methods, can be used by everyday programmers who are maintaining their own libraries.

It’s not your grandfather’s Java any longer, and that’s a good thing.

What Is Functional Programming?
Functional programming is a term that means different things to different people. At the heart of functional programming is thinking about your problem domain in terms of immutable values and functions that translate between them.

The communities that have developed around different programming languages each tend to think that the set of features that have been incorporated into their language are the key ones. At this stage, it’s a bit too early to tell how Java programmers will define functional programming. In a sense, it’s unimportant; what we really care about is writing good code rather than functional code.

In this book, I focus on pragmatic functional programming, including techniques that can be used and understood by most developers and that help them write programs that are easier to read and maintain.

Example Domain
Throughout the book, examples are structured around a common problem domain: music. Specifically, the examples represent the kind of information you might see on albums. Here’s a brief summary of the terms:

Artist
An individual or group who creates music

name: The name of the artist (e.g., “The Beatles”)
members: A set of other artists who comprise this group (e.g., “John Lennon”); this field might be empty
origin: The primary location of origin of the group (e.g., “Liverpool”).
Track
A single piece of music

name: The name of the track (e.g., “Yellow Submarine”)
Album
A single release of music, comprising several tracks

name: The name of the album (e.g., “Revolver”)
tracks: A list of tracks
musicians: A list of artists who helped create the music on this album
This domain is used to illustrate how to use functional programming techniques within a normal business domain or Java application. You may not consider it the perfect example subject, but it’s simple, and many of the code examples in this book will bear similarity to those that you may see in your business domain.