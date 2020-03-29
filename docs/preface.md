# 前言

> Preface

For years, functional programming has been considered the realm of a small band of specialists who consistently claimed superiority to the masses while being unable to spread the wisdom of their approach. The main reason I’ve written this book is to challenge both the idea that there’s an innate superiority in the functional style and the belief that its approach should be relegated to a small band of specialists!

For the last two years in the London Java Community, I’ve been getting developers to try out Java 8 in some form or another. I’ve found that many of our members enjoy the new idioms and libraries that it makes available to them. They may reel at the terminology and elitism, but they love the benefits that a bit of simple functional programming provides to them. A common thread is how much easier it is to read code using the new Streams API to manipulate objects and collections, such as filtering out albums that were made in the UK from a List of all albums.

What I’ve learned when running these kinds of events is that examples matter. People learn by repeatedly digesting simple examples and developing an understanding of patterns out of them. I’ve also noticed that terminology can be very off-putting, so anytime there’s a hard-sounding concept, I give an easy-to-read explanation.

For many people, what Java 8 offers by way of functional programming is incredibly limited: no monads,[1] no language-level lazy evaluation, no additional support for immutability. As pragmatic programmers, this is fine; what we want is the ability to write library-level abstractions so we can write simple, clean code that solves business problems. We’re even happier if someone else has written these libraries for us and we can just focus on doing our daily jobs.

Why Should I Read This Book?
In this book we’ll explore:

How to write simpler, cleaner, and easier-to-read code—especially around collections
How to easily use parallelism to improve performance
How to model your domain more accurately and build better DSLs
How to write less error-prone and simpler concurrent code
How to test and debug your lambda expressions
Developer productivity isn’t the only reason why lambda expressions have been added to Java; there are fundamental forces in our industry at work here as well.

Who Should Read This Book?
This book is aimed squarely at Java developers who already have core Java SE skills and want to get up to speed on the big changes in Java 8.

If you’re interested in reading about lambda expressions and how they can improve your lot as a professional developer, read on! I don’t assume you know about lambda expressions themselves, or any of the core library changes; instead, I introduce concepts, libraries, and techniques from scratch.

Although I would love for every developer who has ever lived to go and buy this book, realistically, it’s not appropriate for everyone. If you don’t know any Java at all, this isn’t the book for you. At the same time, though lambda expressions in Java are very well covered here, I don’t explain how they are used in any other languages.

I don’t provide a basic introduction to the use of several facets of the Java SE, such as collections, anonymous inner classes, or the event handling mechanism in Swing. I assume that you already know about all of these elements.

How to Read This Book
This book is written in an example-driven style: very soon after a concept is introduced, you’ll see some code. Occasionally you might see something in the code that you’re not 100% familar with. Don’t worry—it’ll be explained very soon afterward, frequently in the next paragraph.

This approach also lets you try out the ideas as you go along. In fact, at the end of most chapters there are further examples for you to practice on your own. I highly recommend that you try doing these katas as you get to the end of the chapter. Practice makes perfect, and—as every pragmatic programmer knows—it’s really easy to fool yourself into thinking that you understand some code when in reality you’ve missed a detail.

Because the use of lambda expressions is all about abstracting complexity away into libraries, I introduce a bunch of common library niceties as I go along. Chapters 2 through 6 cover the core language changes and also the improved libraries that JDK 8 brings.

The final three chapters are about applying functional programming in the wild. I’ll talk about a few tricks that make testing and debugging code a bit easier in Chapter 7. Chapter 8 explains how existing principles of good software design also apply to lambda expressions. Then I talk about concurrency and how to use lambda expressions to write concurrent code that’s easy to understand and maintain in Chapter 9. These chapters also introduce third-party libraries, where relevant.

It’s probably worth thinking of the opening four chapters as the introductory material—things that everyone will need to know to use Java 8 properly. The latter chapters are more complex, but they also teach you how to be a more complete programmer who can confidently use lambda expressions in your own designs. There are also exercises as you go along, and the answers to these can be found on GitHub. If you practice the exercises as you go along, you’ll soon master lambda expressions.

Conventions Used in This Book
The following typographical conventions are used in this book:

Italic
Indicates new terms, URLs, email addresses, filenames, and file extensions.
Constant width
Used for program listings, as well as within paragraphs to refer to program elements such as variable or function names, databases, data types, environment variables, statements, and keywords.
Constant width bold
Shows commands or other text that should be typed literally by the user.
Constant width italic
Shows text that should be replaced with user-supplied values or by values determined by context.
TIP
This element signifies a tip or suggestion.

NOTE
This element signifies a general note.

WARNING
This element indicates a warning or caution.

Using Code Examples
Supplemental material (code examples, exercises, etc.) is available for download at https://github.com/RichardWarburton/java-8-lambdas-exercises.

This book is here to help you get your job done. In general, if example code is offered with this book, you may use it in your programs and documentation. You do not need to contact us for permission unless you’re reproducing a significant portion of the code. For example, writing a program that uses several chunks of code from this book does not require permission. Selling or distributing a CD-ROM of examples from O’Reilly books does require permission. Answering a question by citing this book and quoting example code does not require permission. Incorporating a significant amount of example code from this book into your product’s documentation does require permission.

We appreciate, but do not require, attribution. An attribution usually includes the title, author, publisher, and ISBN. For example: “Java 8 Lambdas by Richard Warburton (O’Reilly). Copyright 2014 Richard Warburton, 978-1-449-37077-0.”

If you feel your use of code examples falls outside fair use or the permission given above, feel free to contact us at permissions@oreilly.com.

Safari® Books Online
NOTE
Safari Books Online is an on-demand digital library that delivers expert content in both book and video form from the world’s leading authors in technology and business.

Technology professionals, software developers, web designers, and business and creative professionals use Safari Books Online as their primary resource for research, problem solving, learning, and certification training.

Safari Books Online offers a range of product mixes and pricing programs for organizations, government agencies, and individuals. Subscribers have access to thousands of books, training videos, and prepublication manuscripts in one fully searchable database from publishers like O’Reilly Media, Prentice Hall Professional, Addison-Wesley Professional, Microsoft Press, Sams, Que, Peachpit Press, Focal Press, Cisco Press, John Wiley & Sons, Syngress, Morgan Kaufmann, IBM Redbooks, Packt, Adobe Press, FT Press, Apress, Manning, New Riders, McGraw-Hill, Jones & Bartlett, Course Technology, and dozens more. For more information about Safari Books Online, please visit us online.

How to Contact Us
Please address comments and questions concerning this book to the publisher:

O’Reilly Media, Inc.
1005 Gravenstein Highway North
Sebastopol, CA 95472
800-998-9938 (in the United States or Canada)
707-829-0515 (international or local)
707-829-0104 (fax)
We have a web page for this book, where we list errata, examples, and any additional information. You can access this page at http://oreil.ly/java_8_lambdas.

To comment or ask technical questions about this book, send email to bookquestions@oreilly.com.

For more information about our books, courses, conferences, and news, see our website at http://www.oreilly.com.

Find us on Facebook: http://facebook.com/oreilly

Follow us on Twitter: http://twitter.com/oreillymedia

Watch us on YouTube: http://www.youtube.com/oreillymedia

Acknowledgments
While the name on the cover of this book is mine, many other people have been influential and helpful in its publication.

Thanks should go firstly to my editor, Meghan, and the team at O’Reilly for making this process a pleasurable experience and accelerating their deadlines where appropriate. It was great to be introduced to Meghan by Martijn and Ben to begin with; this book would never have happened without that meeting.

The review process was a huge step in improving the overall quality of the book, and my heartfelt appreciation goes out to those who have helped as part of the formal and informal review process, including Martijn Verburg, Jim Gough, John Oliver, Edward Wong, Brian Goetz, Daniel Bryant, Fred Rosenberger, Jaikiran Pai, and Mani Sarkar. Martijn in particular has been hugely helpful with his battle-won advice on writing a technical book.

It would also be remiss of me to ignore the Project Lambda development team at Oracle. Updating an established language is a big challenge, and they’ve done a great job in Java 8 of giving me something fun to write about and support. The London Java Community also deserves its share of praise for being so actively involved and supportive when helping to test out the early Java release and making it so easy to see what kinds of mistakes developers make and what can be fixed.

A lot of people have been incredibly supportive and helpful while I was going through the effort of writing a book. I’d like to specifically call out my parents, who have always been there whenever they were needed. It has also been great to have encouragement and positive comments from friends such as old compsoc members, especially Sadiq Jaffer and the Boys Brigade.