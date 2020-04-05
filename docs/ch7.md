# 第 7 章 测试、调试和重构

> Chapter 7. Testing, Debugging, and Refactoring

The rising popularity of techniques such as refactoring, test-driven development (TDD), and continuous integration (CI) mean that if we’re going to use lambda expressions in our day-to-day programming, we need to understand how to test code using them and written with them.

A wealth of material has been written on how to test and debug computer programs, and this chapter isn’t going to revisit all that material. If you’re interested in learning how to do TDD properly, I highly recommend the books Test-Driven Development by Kent Beck and Growing Object-Oriented Software, Guided by Tests by Steve Freeman and Nat Pryce (both from Addison-Wesley).

I am going to cover techniques specific to using lambda expressions in your code, and when you might not want to (directly) use lambda expressions at all. I’ll also talk about some appropriate techniques for debugging programs that heavily use lambda expressions and streams.

We’re first going to look at some examples of how to refactor an existing code base into using lambda expressions. I’ve talked a bit already about how to do local refactoring operations, such as replacing a for loop with a stream operation. Here we’ll take a more in-depth look at how non-collection code can be improved.

## 7.1 Lambda Refactoring Candidates

The process of refactoring code to take advantage of lambdas has been given the snazzy name point lambdafication (pronounced lambda-fi-cation, practitioners of this process being “lamb-di-fiers” or “responsible developers”). It’s a process that has happened within the Java core libraries for Java 8. When you’re choosing how to model the internal design of your application, it’s also really worth considering which API methods to expose in this way.

There are a few key heuristics that can help you out when identifying an appropriate place to lambdify your application or library code. Each of these can be considered a localized antipattern or code smell that you’re fixing through point lambdification.

### 7.1.1 IN, OUT, IN, OUT, SHAKE IT ALL ABOUT

In Example 7-1, I’ve repeated our example code from Chapter 4 about logging statements. You’ll see that it’s pulling out the Boolean value from isDebugEnabled only to check it and then call a method on the Logger. If you find that your code is repeatedly querying and operating on an object only to push a value back into that object at the end, then that code belongs in the class of the object that you’re modifying.

Example 7-1. A logger using isDebugEnabled to avoid performance overhead

```java
Logger logger = new Logger();
if (logger.isDebugEnabled()) {
    logger.debug("Look at this: " + expensiveOperation());
}
```

Logging is a good example of where this has historically been difficult to achieve, because in different locations you’re trying to provide different behavior. In this case, the behavior is building up a message string that will differ depending upon where in your program you’re logging and what information you’re trying to log.

This antipattern can be easily solved by passing in code as data. Instead of querying an object and then setting a value on it, you can pass in a lambda expression that represents the relevant behavior by computing a value. I’ve also repeated the code solution in Example 7-2, as a reminder. The lambda expression gets called if we’re at a debug level and the logic for checking this call remains inside of the Logger itself.

Example 7-2. Using lambda expressions to simplify logging code

```java
Logger logger = new Logger();
logger.debug(() -> "Look at this: " + expensiveOperation());
```

Logging is also a demonstration of using lambda expressions to do better object-oriented programming (OOP). A key OOP concept is to encapsulate local state, such as the level of the logger. This isn’t normally encapsulated very well, as isDebugEnabled exposes its state. If you use the lambda-based approach, then the code outside of the logger doesn’t need to check the level at all.

### 7.1.2 THE LONELY OVERRIDE

In this code smell, you subclass solely to override a single method. The ThreadLocal class is a good example of this. ThreadLocal allows us to create a factory that generates at most one value per thread. This is an easy way of ensuring that a thread-unsafe class can be safely used in a concurrent environment. For example, if we need to look up an artist from the database but want to do it once per thread, then we might write something like the code in Example 7-3.

Example 7-3. Looking up an artist from the database

```java
ThreadLocal<Album> thisAlbum = new ThreadLocal<Album> () {
    @Override protected Album initialValue() {
        return database.lookupCurrentAlbum();
    }
};
```

In Java 8 we can use the factory method withInitial and pass in a Supplier instance that deals with the creation, as shown in Example 7-4.

Example 7-4. Using the factory method

```java
ThreadLocal<Album> thisAlbum
    = ThreadLocal.withInitial(() -> database.lookupCurrentAlbum());
```

There are a few reasons why the second example would be considered preferable to the first. For a start, any existing instance of `Supplier<Album>` can be used here without needing to be repackaged for this specific case, so it encourages reuse and composition.

It’s also shorter to write, which is an advantage if and only if all other things are equal. More important, it’s shorter because it’s a lot cleaner: when reading the code, the signal-to-noise ratio is lower. This means you spend more time solving the actual problem at hand and less time dealing with subclassing boilerplate. It also has the advantage that it’s one fewer class that your JVM has to load.

It’s also a lot clearer to anyone who tries to read the code what its intent is. If you try to read out loud the words in the second example, you can easily hear what it’s saying. You definitely can’t say this of the first example.

Interestingly, this wasn’t an antipattern previously to Java 8—it was the idiomatic way of writing this code, in the same way that using anonymous inner classes to pass around behavior wasn’t an antipattern, just the only way of expressing what you wanted in Java code. As the language evolves, so do the idioms that you use when programming.

### 7.1.3 BEHAVIORAL WRITE EVERYTHING TWICE

Write Everything Twice (WET) is the opposite of the well-known Don’t Repeat Yourself (DRY) pattern. This code smell crops up in situations where your code ends up in repetitive boilerplate that produces more code that needs to be tested, is harder to refactor, and is brittle to change.

Not all WET situations are suitable candidates for point lambdification. In some situations, couple duplication can be the only alternative to having an overly closely coupled system. There’s a good heuristic for situations where WET suggests it’s time to add some point lambdification into your application. Try adding lambdas where you want to perform a similar overall pattern but have a different behavior from one variant to another.

Let’s look at a more concrete example. On top of our music domain, I’ve decided to add a simple Order class that calculates useful properties about some albums that a user wants to buy. We’re going to count the number of musicians, number of tracks, and running time of our Order. If we were using imperative Java, we would write some code like Example 7-5.

Example 7-5. An imperative implementation of our Order class

```java
public long countRunningTime() {
    long count = 0;
    for (Album album : albums) {
        for (Track track : album.getTrackList()) {
            count += track.getLength();
        }
    }
    return count;
}

public long countMusicians() {
    long count = 0;
    for (Album album : albums) {
        count += album.getMusicianList().size();
    }
    return count;
}

public long countTracks() {
    long count = 0;
    for (Album album : albums) {
        count += album.getTrackList().size();
    }
    return count;
}
```

In each case, we’ve got the boilerplate code of adding some code for each album to the total—for example, the length of each track or the number of musicians. We’re failing at reusing common concepts and also leaving ourselves more code to test and maintain. We can shorten and tighten this code by rewriting it using the Stream abstraction and the Java 8 collections library. Example 7-6 is what we would come up with if we directly translated the imperative code to streams.

Example 7-6. A refactor of our imperative Order class to use streams

```java
public long countRunningTime() {
    return albums.stream()
            .mapToLong(album -> album.getTracks()
                                     .mapToLong(track -> track.getLength())
                                     .sum())
            .sum();
}

public long countMusicians() {
    return albums.stream()
            .mapToLong(album -> album.getMusicians().count())
            .sum();
}

public long countTracks() {
    return albums.stream()
            .mapToLong(album -> album.getTracks().count())
            .sum();
}
```

It still suffers from the same reuse and readability issues, because there are certain abstractions and commonalities that are only expressible in domain terms. The streams library won’t provide a method for you to count the number of a certain thing per album—that’s the kind of domain method that you should be writing yourself. It’s also the kind of domain method that was very hard to write before Java 8 because it’s doing a different thing for each method.

Let’s think about how we’re going to implement such a function. We’re going to return a long with the count of some feature for all the albums. We also need to take in some kind of lambda expression that tells us what the number for each album is. This means we need a method parameter that returns us a long for each album; conveniently, there is already a ToLongFunction in the Java 8 core libraries. As shown in Figure 7-1, it is parameterized by its argument type, so we’re using `ToLongFunction<Album>`.

ToLongFunction
Figure 7-1. ToLongFunction

Now that we’ve made these decisions, the body of the method follows naturally. We take a Stream of the albums, map each album to a long, and then sum them. When we implement the consumer-facing methods such as countTracks, we pass in a lambda expression with behavior specific to that domain method. In this case, we’re mapping the album to the number of tracks. Example 7-7 is what our code looks like when we’ve converted the code to use this domain-appropriate method.

Example 7-7. A refactor of our Order class to use domain-level methods

```java
public long countFeature(ToLongFunction<Album> function) {
    return albums.stream()
            .mapToLong(function)
            .sum();
}

public long countTracks() {
    return countFeature(album -> album.getTracks().count());
}

public long countRunningTime() {
    return countFeature(album -> album.getTracks()
                                      .mapToLong(track -> track.getLength())
                                      .sum());
}

public long countMusicians() {
    return countFeature(album -> album.getMusicians().count());
}
```

## 7.2 Unit Testing Lambda Expressions

NOTE

Unit testing is a method of testing individual chunks of code to ensure that they are behaving as intended.

Usually, when writing a unit test you call a method in your test code that gets called in your application. Given some inputs and possibly test doubles, you call these methods to test a certain behavior happening and then specify the changes you expect to result from this behavior.

Lambda expressions pose a slightly different challenge when unit testing code. Because they don’t have a name, it’s impossible to directly call them in your test code.

You could choose to copy the body of the lambda expression into your test and then test that copy, but this approach has the unfortunate side effect of not actually testing the behavior of your implementation. If you change the implementation code, your test will still pass even though the implementation is performing a different task.

There are two viable solutions to this problem. The first is to view the lambda expression as a block of code within its surrounding method. If you take this approach, you should be testing the behavior of the surrounding method, not the lambda expression itself. Let’s take look Example 7-8, which gives an example method for converting a list of strings into their uppercase equivalents.

Example 7-8. Converting strings into their uppercase equivalents

```java
public static List<String> allToUpperCase(List<String> words) {
    return words.stream()
                .map(string -> string.toUpperCase())
                .collect(Collectors.<String>toList());
}
```

The only thing that the lambda expression in this body of code does is directly call a core Java method. It’s really not worth the effort of testing this lambda expression as an independent unit of code at all, since the behavior is so simple.

If I were to unit test this code, I would focus on the behavior of the method. For example, Example 7-9 is a test that if there are multiple words in the stream, they are all converted to their uppercase equivalents.

Example 7-9. Testing conversion of words to uppercase equivalents

```java
@Test
public void multipleWordsToUppercase() {
    List<String> input = Arrays.asList("a", "b", "hello");
    List<String> result = Testing.allToUpperCase(input);
    assertEquals(asList("A", "B", "HELLO"), result);
}
```

Sometimes you want to use a lambda expression that exhibits complex functionality. Perhaps it has a number of corner cases or a role involving calculating a highly important function in your domain. You really want to test for behavior specific to that body of code, but it’s in a lambda expression and you’ve got no way of referencing it.

As an example problem, let’s look at a method that is slightly more complex than converting a list of strings to uppercase. Instead, we’ll be converting the first character of a string to uppercase and leaving the rest as is. If we were to write this using streams and lambda expressions, we might write something like Example 7-10. Our lambda expression doing the conversion is at 1.

Example 7-10. Convert first character of all list elements to uppercase

```java
public static List<String> elementFirstToUpperCaseLambdas(List<String> words) {
    return words.stream()
            .map(value -> {  1
                char firstChar = Character.toUpperCase(value.charAt(0));
                return firstChar + value.substring(1);
            })
            .collect(Collectors.<String>toList());
}
```

Should we want to test this, we’d need to fire in a list and test the output for every single example we wanted to test. Example 7-11 provides an example of how cumbersome this approach becomes. Don’t worry—there is a solution!

Example 7-11. Testing that in a two-character string, only the first character is converted to uppercase

```java
@Test
public void twoLetterStringConvertedToUppercaseLambdas() {
    List<String> input = Arrays.asList("ab");
    List<String> result = Testing.elementFirstToUpperCaseLambdas(input);
    assertEquals(asList("Ab"), result);
}
```

Don’t use a lambda expression. I know that might appear to be strange advice in a book about how to use lambda expressions, but square pegs don’t fit into round holes very well. Having accepted this, we’re bound to ask how we can still unit test our code and have the benefit of lambda-enabled libraries.

Do use method references. Any method that would have been written as a lambda expression can also be written as a normal method and then directly referenced elsewhere in code using method references.

In Example 7-12 I’ve refactored out the lambda expression into its own method. This is then used by the main method, which deals with converting the list of strings.

Example 7-12. Converting the first character to uppercase and applying it to a list

```java
public static List<String> elementFirstToUppercase(List<String> words) {
    return words.stream()
                .map(Testing::firstToUppercase)
                .collect(Collectors.<String>toList());
}

public static String firstToUppercase(String value) {  1
    char firstChar = Character.toUpperCase(value.charAt(0));
    return firstChar + value.substring(1);
}
```

Having extracted the method that actually performs string processing, we can cover all the corner cases by testing that method on its own. The same test case in its new, simplified form is shown in Example 7-13.

Example 7-13. The two-character test applied to a single method

```java
@Test
public void twoLetterStringConvertedToUppercase() {
    String input = "ab";
    String result = Testing.firstToUppercase(input);
    assertEquals("Ab", result);
}
```

## 7.3 Using Lambda Expressions in Test Doubles

A pretty common part of writing unit tests is to use test doubles to describe the expected behavior of other components of the system. This is useful because unit testing tries to test a class or method in isolation of the other components of your code base, and test doubles allow you to implement this isolation in terms of tests.

NOTE

Even though test doubles are frequently referred to as mocks, actually both stubs and mocks are types of test double. The difference is that mocks allow you to verify the code’s behavior. The best place to understand more about this is Martin Fowler’s article on the subject.

One of the simplest ways to use lambda expressions in test code is to implement lightweight stubs. This is really easy and natural to implement if the collaborator to be stubbed is already a functional interface.

In Behavioral Write Everything Twice, I discussed how to refactor our common domain logic into a countFeature method that used a lambda expression to implement different counting behavior. Example 7-14 shows how we might go about unit testing part of its behavior.

Example 7-14. Using a lambda expression as a test double by passing it to countFeature

```java
    @Test
    public void canCountFeatures() {
        OrderDomain order = new OrderDomain(asList(
                newAlbum("Exile on Main St."),
                newAlbum("Beggars Banquet"),
                newAlbum("Aftermath"),
                newAlbum("Let it Bleed")));

        assertEquals(8, order.countFeature(album -> 2));
    }
```

The expected behavior is that the countFeature method returns the sum of some number for each album it’s passed. So here I’m passing in four different albums, and the stub in my test is returning a count of 2 features for each album. I assert that the method returns 8—that is, 2×4. If you expect to pass a lambda expression into your code, then it’s usually the right thing to have your test also pass in a lambda expression.

Most test doubles end up being the result of more complex expectation setting. In these situations, frameworks such as Mockito are often used to easily generate test doubles. Let’s consider a simple example in which we want to produce a test double for a List. Instead of returning the size of the List, we want to return the size of another List. When mocking the size method of the List, we don’t want to specify just a single answer. We want our answer to perform some operation, so we pass in a lambda expression (Example 7-15).

Example 7-15. Using a lambda expression in conjunction with the Mockito library

```java
List<String> list = mock(List.class);

when(list.size()).thenAnswer(inv -> otherList.size());

assertEquals(3, list.size());
```

Mockito uses an Answer interface that lets you provide alternative implementation behavior. In other words, it already supports our familiar friend: passing code as data. We can use a lambda expression here because Answer is, conveniently, a functional interface.

## 7.4 Lazy Evaluation Versus Debugging

Using a debugger typically involves stepping through statements of your program or attaching breakpoints. Sometimes you might encounter situations using the streams library where debugging becomes a little bit more complex, because the iteration is controlled by the library and many stream operations are lazily evaluated.

In the traditional imperative view of the world, in which code is a sequence of actions that achieve a goal, introspecting state after or before an action makes perfect sense. In Java 8, you still have access to all your existing IDE debugging tools, but sometimes you need to tweak your approach a little in order to achieve good results.

## 7.5 Logging and Printing

Let’s say you’re performing a series of operations on a collection and you’re trying to debug the code; you want to see what the result of an individual operation is. One thing you could do is print out the collection value after each step. This is pretty hard with the Streams framework, as intermediate steps are lazily evaluated.

Let’s take a look at how we might log intermediate values by taking a look at an imperative version of our nationality report from Chapter 3. In case you’ve forgotten, and who doesn’t sometimes, this is code that tries to find the country of origin for every artist on an album. In Example 7-16 we’re going to log each of the nationalities that we find.

Example 7-16. Logging intermediate values in order to debug a for loop

```java
Set<String> nationalities = new HashSet<>();
for (Artist artist : album.getMusicianList()) {
    if (artist.getName().startsWith("The")) {
        String nationality = artist.getNationality();
        System.out.println("Found nationality: " + nationality);
        nationalities.add(nationality);
    }
}
return nationalities;
```

Now we could use the forEach method to print out the values from the stream, which would also cause it to be evaluated. However, this way has the downside that we can’t continue to operate on that stream, because streams can only be used once. If we really want to use this approach, we need to recreate the stream. Example 7-17 shows how ugly this can get.

Example 7-17. Using a naive forEach to log intermediate values

```java
album.getMusicians()
     .filter(artist -> artist.getName().startsWith("The"))
     .map(artist -> artist.getNationality())
     .forEach(nationality -> System.out.println("Found: " + nationality));

Set<String> nationalities
    = album.getMusicians()
           .filter(artist -> artist.getName().startsWith("The"))
           .map(artist -> artist.getNationality())
           .collect(Collectors.<String>toSet());
```

## 7.6 The Solution: peek

Fortunately, the streams library contains a method that lets you look at each value in turn and also lets you continue to operate on the same underlying stream. It’s called peek. In Example 7-18, we have rewritten the previous example using peek in order to print out the stream values without having to repeat the pipeline of stream operations.

Example 7-18. Using peek to log intermediate values

```java
Set<String> nationalities
    = album.getMusicians()
           .filter(artist -> artist.getName().startsWith("The"))
           .map(artist -> artist.getNationality())
           .peek(nation -> System.out.println("Found nationality: " + nation))
           .collect(Collectors.<String>toSet());
```

It’s also possible to use the peek method to output to existing logging systems such as log4j, java.util.logging, or slf4j in exactly the same way.

## 7.7 Midstream Breakpoints

Logging is just one of many tricks that the peek method has up its sleeve. To allow us to debug a stream element by element, as we might debug a loop step by step, a breakpoint can be set on the body of the peek method.

In this case, peek can just have an empty body that you set a breakpoint in. Some debuggers won’t let you set a breakpoint in an empty body, in which case I just map a value to itself in order to be able to set the breakpoint. It’s not ideal, but it works fine.

## 7.8 Key Points

- Consider how lambda expressions can help when refactoring legacy code: there are common patterns.
- If you want to unit test a lambda expression of any complexity, extract it to a regular method.
- The peek method is very useful for logging out intermediate values when debugging.
