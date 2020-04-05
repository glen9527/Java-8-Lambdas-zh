# 第 3 章 流

> Chapter 3. Streams

The language changes introduced in Java 8 are intended to help us write better code. New core libraries are a key part of that, so in this chapter we start to look at them. The most important core library changes are focused around the Collections API and its new addition: streams. Streams allow us to write collections-processing code at a higher level of abstraction.

The Stream interface contains a series of functions that we’ll explore throughout this chapter, each of which corresponds to a common operation that you might perform on a Collection.

## 3.1 From External Iteration to Internal Iteration

TIP

A lot of the examples in this chapter and the rest of the book refer to domain classes, which were introduced in Example Domain.

A common pattern for Java developers when working with collections is to iterate over a collection, operating on each element in turn. For example, if we wanted to add up the number of musicians who are from London, we would write the code in Example 3-1.

Example 3-1. Counting London-based artists using a for loop

```java
int count = 0;
for (Artist artist : allArtists) {
    if (artist.isFrom("London")) {
        count++;
    }
}
```

There are several problems with this approach, though. It involves a lot of boilerplate code that needs to be written every time you want to iterate over the collection. It’s also hard to write a parallel version of this for loop. You would need to rewrite every for loop individually in order to make them operate in parallel.

Finally, the code here doesn’t fluently convey the intent of the programmer. The boilerplate for loop structure obscures meaning; to understand anything we must read though the body of the loop. For a single for loop, doing this isn’t too bad, but when you have a large code base full of them it becomes a burden (especially with nested loops).

Looking under the covers a little bit, the for loop is actually syntactic sugar that wraps up the iteration and hides it. It’s worth taking a moment to look at what’s going on under the hood here. The first step in this process is a call to the iterator method, which creates a new Iterator object in order to control the iteration process. We call this external iteration. The iteration then proceeds by explicitly calling the hasNext and next methods on this Iterator. Example 3-2 demonstrates the expanded code in full, and Figure 3-1 shows the pattern of method calls that happen.

Example 3-2. Counting London-based artists using an iterator

```java
int count = 0;
Iterator<Artist> iterator = allArtists.iterator();
while(iterator.hasNext()) {
    Artist artist = iterator.next();
    if (artist.isFrom("London")) {
        count++;
    }
}
```

.External Iteration
Figure 3-1. External iteration

External iteration has some negative issues associated with it, too. First, it becomes hard to abstract away the different behavioral operations that we’ll encounter later in this chapter. It is also an approach that is inherently serial in nature. The big-picture issue here is that using a for loop conflates what you are doing with how you are doing it.

An alternative approach, internal iteration, is shown in Example 3-3. The first thing to notice is the call to stream(), which performs a similar role to the call to iterator() in the previous example. Instead of returning an Iterator to control the iteration, it returns the equivalent interface in the internal iteration world: Stream.

Example 3-3. Counting London-based artists using internal iteration

```java
long count = allArtists.stream()
                       .filter(artist -> artist.isFrom("London"))
                       .count();
```

Figure 3-2 depicts the flow of method calls with respect to the library; compare it with Figure 3-1.

.Internal Iteration
Figure 3-2. Internal iteration

NOTE

A Stream is a tool for building up complex operations on collections using a functional approach.

We can actually break this example into two simpler operations:

- Finding all the artists from London
- Counting a list of artists

Both of these operations correspond to a method on the Stream interface. In order to find artists from London, we filter the Stream. Filtering in this case means “keep only objects that pass a test.” The test is defined by a function, which returns either true or false depending on whether the artist is from London. Because we’re practicing functional programming when using the Streams API, we aren’t changing the contents of the Collection; we’re just declaring what the contents of the Stream will be. The count() method counts how many objects are in a given Stream.

## 3.2 What’s Actually Going On

When I wrote the previous example, I broke it up into two simpler operations: filtering and counting. You may think that this is pretty wasteful—when I wrote the for loop in Example 3-1, there was only one loop. It looks like you would need two here, as there are two operations. In fact, the library has been cleverly designed so that it iterates over the list of artists only once.

In Java, when you call a method it traditionally corresponds to the computer actually doing something; for example, System.out.println("Hello World"); prints output to your terminal. Some of the methods on Stream work a little bit differently. They are normal Java methods, but the Stream object returned isn’t a new collection—it’s a recipe for creating a new collection. So just think for a second about what the code in Example 3-4 does. Don’t worry if you get stuck—I’ll explain in a bit!

Example 3-4. Just the filter, no collect step

```java
allArtists.stream()
          .filter(artist -> artist.isFrom("London"));
```

It actually doesn’t do very much at all—the call to filter builds up a Stream recipe, but there’s nothing to force this recipe to be used. Methods such as filter that build up the Stream recipe but don’t force a new value to be generated at the end are referred to as lazy. Methods such as count that generate a final value out of the Stream sequence are called eager.

The easiest way of seeing that is if we add in a println statement as part of the filter in order to print out the artists’ names. Example 3-5 is a modified version of Example 3-4 with such a printout. If we run this code, the program doesn’t print anything when it’s executed.

Example 3-5. Not printing out artist names due to lazy evaluation

```java
allArtists.stream()
          .filter(artist -> {
              System.out.println(artist.getName());
              return artist.isFrom("London");
          });
```

If we add the same printout to a stream that has a terminal step, such as the counting operation from Example 3-3, then we will see the names of our artists printed out (Example 3-6).

Example 3-6. Printing out artist names

```java
long count = allArtists.stream()
                       .filter(artist -> {
                           System.out.println(artist.getName());
                           return artist.isFrom("London");
                       })
                       .count();
```

So, if you ran Example 3-6 with the members of The Beatles as your list of artists, then you would see Example 3-7 printed out on your command line.

Example 3-7. Sample output showing the members of The Beatles being printed

```
John Lennon
Paul McCartney
George Harrison
Ringo Starr
```

It’s very easy to figure out whether an operation is eager or lazy: look at what it returns. If it gives you back a Stream, it’s lazy; if it gives you back another value or void, then it’s eager. This makes sense because the preferred way of using these methods is to form a sequence of lazy operations chained together and then to have a single eager operation at the end that generates your result. This is how our counting example operates, but it’s the simplest case: only two operations.

This whole approach is somewhat similar to the familiar builder pattern. In the builder pattern, there are a sequence of calls that set up properties or configuration, followed by a single call to a build method. The object being created isn’t created until the call to build occurs.

I’m sure you’re asking, “Why would we want to have the differentiator between lazy and eager options?” By waiting until we know more about what result and operations are needed, we can perform the computations more efficiently. A good example is finding the first number that is > 10. We don’t need to evaluate all the elements to figure this out—only enough to find our first match. It also means that we can string together lots of different operations over our collection and iterate over the collection only once.

## 3.3 Common Stream Operations

At this point, it’s worth just having a look back at some common Stream operations in order to get more of a feel of what’s available in the API. As we will cover only a few important examples, I recommend looking at the Javadoc for the new API to see what else is available.

## 3.3.1 COLLECT(TOLIST())

NOTE

collect(toList()) is an eager operation that generates a list from the values in a Stream.

The values in the Stream that are operated on are derived from the initial values and the recipe produced by the sequence of Stream calls. In fact, collect is a very general and powerful construct, and we’ll look into its other uses in more detail in Chapter 5. Here’s an example of this operation:

```java
List<String> collected = Stream.of("a", "b", "c")  1
                               .collect(Collectors.toList());  2

assertEquals(Arrays.asList("a", "b", "c"), collected);  3
```

This example shows how collect(toList()) can be used to build a result list out of a Stream. It’s important to remember, as discussed in the previous section, that because many Stream functions are lazy, you do need to use an eager operation such as collect at the end of a sequence of chained method calls.

This example also shows the general format for all the examples in this section. It starts by taking a Stream from a List 1. There is some operation, followed by collecting into a list 2. Finally, we perform an assert to show you what the results are equal to 3.

You can think of the opening call to stream and the closing call to a collect or other terminal method as bun methods. They aren’t the actual filling of our stream burger, but they do help us see where the operations begin and end.

### 3.3.2 MAP

NOTE
If you’ve got a function that converts a value of one type into another, map lets you apply this function to a stream of values, producing another stream of the new values.

You’ll probably notice fairly soon that you’ve been doing some kind of map operations for years already. Say you are writing Java code that takes a list of strings and converts them to their uppercase equivalents. You would loop over all the values in the list and call toUppercase on each element. You would then add each of the resulting values into a new List. Example 3-8 is code written in this style.

Example 3-8. Converting strings to uppercase equivalents using a for loop

```java
List<String> collected = new ArrayList<>();
for (String string : asList("a", "b", "hello")) {
    String uppercaseString = string.toUpperCase();
    collected.add(uppercaseString);
}

assertEquals(asList("A", "B", "HELLO"), collected);
```

map is one of the most commonly used Stream operations (see Figure 3-3). You could probably have guessed this, given how frequently you have implemented something similar to the aforementioned for loop. Example 3-9 is the same example of turning a list of strings into their uppercase equivalents using the stream framework.

the map operation
Figure 3-3. The map operation

Example 3-9. Converting strings to uppercase equivalents using map

```java
List<String> collected = Stream.of("a", "b", "hello")
                               .map(string -> string.toUpperCase())  1
                               .collect(toList());

assertEquals(asList("A", "B", "HELLO"), collected);
```

The lambda expression passed into map 1 both takes a String as its only argument and returns a String. It isn’t necessary for both the argument and the result to be the same type, but the lambda expression passed in must be an instance of Function (Figure 3-4). This is a generic functional interface with only one argument.

the Function interface
Figure 3-4. The Function interface

### 3.3.3 FILTER

NOTE

Any time you’re looping over some data and checking each element, you might want to think about using the new filter method on Stream (see Figure 3-5).

the filter operation
Figure 3-5. The filter operation

We’ve already looked at a filter example, so you may want to skip this section if you feel familiar with the concept. Still here? Good! Suppose we’ve got a list of strings and we want to find all the strings that start with a digit. So, "1abc" would be accepted and "abc" wouldn’t. We might write some code that loops over a list and uses an if statement to see what the first character is, something like the code in Example 3-10.

Example 3-10. Looping over a list and using an if statement

```java
List<String> beginningWithNumbers = new ArrayList<>();
for(String value : asList("a", "1abc", "abc1")) {
    if (isDigit(value.charAt(0))) {
        beginningWithNumbers.add(value);
    }
}

assertEquals(asList("1abc"), beginningWithNumbers);
```

I’m sure you’ve written some code that looks like this: it’s called the filter pattern. The central idea of filter is to retain some elements of the Stream, while throwing others out. Example 3-11 shows how you would write the same code in a functional style.

Example 3-11. Functional style

```java
List<String> beginningWithNumbers
  = Stream.of("a", "1abc", "abc1")
          .filter(value -> isDigit(value.charAt(0)))
          .collect(toList());

assertEquals(asList("1abc"), beginningWithNumbers);
```

Much like map, filter is a method that takes just a single function as an argument—here we’re using a lambda expression. This function does the same job that the expression in the if statement did earlier. Here, it returns true if the String starts with a digit. If you’re refactoring legacy code, the presence of an if statement in the middle of a for loop is a pretty strong indicator that you really want to use filter.

Because this function is doing the same job as the if statement, it must return either true or false for a given value. The Stream after the filter has the elements of the Stream beforehand, which evaluated to true. The functional interface for this type of function is our old friend from the previous chapter, the Predicate (shown in Figure 3-6).

the Predicate interface
Figure 3-6. The Predicate interface

### 3.3.4 FLATMAP

NOTE

flatMap (see Figure 3-7) lets you replace a value with a Stream and concatenates all the streams together.

the flatMap operation
Figure 3-7. The flatMap operation

You’ve already seen the map operation, which replaces a value in a Stream with a new value. Sometimes you want a variant of map in which you produce a new Stream object as the replacement. Frequently you don’t want to end up with a stream of streams, though, and this is where flatMap comes in handy.

Let’s look at a simple example. We’ve got a Stream of lists of numbers, and we want all the numbers from these in sequences. We can solve this problem using an approach like the one in Example 3-12.

Example 3-12. Stream list

```java
List<Integer> together = Stream.of(asList(1, 2), asList(3, 4))
                               .flatMap(numbers -> numbers.stream())
                               .collect(toList());

assertEquals(asList(1, 2, 3, 4), together);
```

In each case, we replace the List with a Stream using the stream method, and flatMap does the rest. Its associated functional interface is the same as map’s—the Function—but its return type is restricted to streams and not any value.

### 3.3.5 MAX AND MIN

A pretty common operation that we might want to perform on streams is finding the maximum or minimum element. Fortunately, this case is very well covered by the max and min operations that are provided by the Streams API. As a demonstration of these operations, Example 3-13 provides some code that finds the shortest track on an album. In order to make it easier to see that we’ve got the right result, I’ve explicitly listed the tracks on this album in the code snippet; I’ll admit that it’s not the best-known album.

Example 3-13. Finding the shortest track with streams

```java
List<Track> tracks = asList(new Track("Bakai", 524),
                            new Track("Violets for Your Furs", 378),
                            new Track("Time Was", 451));

Track shortestTrack = tracks.stream()
                            .min(Comparator.comparing(track -> track.getLength()))
                            .get();

assertEquals(tracks.get(1), shortestTrack);
```

When we think about maximum and minimum elements, the first thing we need to think about is the ordering that we’re going to be using. When it comes to finding the shortest track, the ordering is provided by the length of the tracks.

In order to inform the Stream that we’re using the length of the track, we give it a Comparator. Conveniently, Java 8 has added a static method called comparing that lets us build a comparator using keys. Previously, we always encountered an ugly pattern in which we had to write code that got a field out of both the objects being compared, then compare these field values. Now, to get the same element out of both elements being compared, we just provide a getter function for the value. In this case we’ll use length, which is a getter function in disguise.

It’s worth reflecting on the comparing method for a moment. This is actually a function that takes a function and returns a function. Pretty meta, I know, but also incredibly useful. At any point in the past, this method could have been added to the Java standard library, but the poor readability and verbosity issues surrounding anonymous inner classes would have made it impractical. Now, with lambda expressions, it’s convenient and concise.

It’s now possible for max to be called on an empty Stream so that it returns what’s known as an Optional value. An Optional value is a bit like an alien: it represents a value that may exist, or may not. If our Stream is empty, then it won’t exist; if it’s not empty, then it will. Let’s not worry about the details of Optional for the moment, since we’ll be discussing it in detail in Optional. The only thing to remember is that we can pull out the value by calling the get method.

### 3.3.6 A COMMON PATTERN APPEARS

max and min are both forms of a more general pattern of coding. The easiest way to see this is by taking our code from Example 3-13 and rewriting it into a for loop: we’ll then extract the general pattern. Example 3-14 performs the same role as Example 3-13: it finds the shortest track on an album, but using a for loop.

Example 3-14. Finding the shortest track with a for loop

```java
List<Track> tracks = asList(new Track("Bakai", 524),
                            new Track("Violets for Your Furs", 378),
                            new Track("Time Was", 451));

Track shortestTrack = tracks.get(0);
for (Track track : tracks) {
    if (track.getLength() < shortestTrack.getLength()) {
        shortestTrack = track;
    }
}

assertEquals(tracks.get(1), shortestTrack);
```

The code starts by initializing our shortestTrack variable with the first element of the list. Then it goes through the tracks. If there’s a shorter track, it replaces the shortestTrack. At the end, our shortestTrack variable contains its namesake. Doubtless you’ve written thousands of for loops in your coding career, and many of them follow this pattern. The pseudocode in Example 3-15 characterizes the general form.

Example 3-15. The reduce pattern

```java
Object accumulator = initialValue;
for(Object element : collection) {
    accumulator = combine(accumulator, element);
}
```

An accumulator gets pushed through the body of the loop, with the final value of the accumulator being the value that we were trying to compute. The accumulator starts with an initialValue and then gets folded together with each element of the list by calling combine.

The things that differ between implementations of this pattern are the initialValue and the combine function. In the original example, we used the first element in the list as our initialValue, but it doesn’t have to be. In order to find the shortest value, our combine returned the shorter track of out of the current element and the accumulator.

We’ll now take a look at how this general pattern can be codified by an operation in the Streams API itself.

### 3.3.7 REDUCE

Use the reduce operation when you’ve got a collection of values and you want to generate a single result. In earlier examples, we used the count, min, and max methods, which are all in the standard library because they are common use cases. All of these are forms of reduction.

Let’s demonstrate the reduce operation by adding up streams of numbers. The overall pattern is demonstrated in Figure 3-8. We start with a count of 0—the count of an empty Stream—and fold together each element with an accumulator, adding the element to the accumulator at every step. When we reach the final Stream element, our accumulator has the sum of all the elements.

Implementing addition using the reduce operation
Figure 3-8. Implementing addition using the reduce operation

Example 3-16 shows what is going on in code. The lambda expression, known as a reducer, performs the summing and takes two arguments. acc is the accumulator and holds the current sum. It is also passed in the current element in the Stream.

Example 3-16. Implementing sum using reduce

```java
int count = Stream.of(1, 2, 3)
                  .reduce(0, (acc, element) -> acc + element);

assertEquals(6, count);
```

The lambda expression returns the new acc value, which is the previous acc added to the current element. The type of the reducer is a BinaryOperator, which we encountered in Chapter 2.

NOTE

Primitives also refers to an implementation of sum within the standard library, which is recommended instead of the approach shown in this example in real code.

Table 3-1 shows the intermediate values for these variables for each element in the Stream. In fact, we could expand all the function applications that reduce to produce the code in Example 3-17.

Example 3-17. Expanding the application of reduce

```java
    BinaryOperator<Integer> accumulator = (acc, element) -> acc + element;
    int count = accumulator.apply(
                    accumulator.apply(
                        accumulator.apply(0, 1),
                    2),
                3);
```

Table 3-1. Evaluating a sum reduce

| element | acc | Result |
| ------- | --- | ------ |
| N/A     | N/A | 0      |
| 1       | 0   | 1      |
| 2       | 1   | 3      |
| 3       | 3   | 6      |

Let’s look at the equivalent imperative Java code, written in Example 3-18, so we can see how the functional and imperative versions match up.

Example 3-18. Imperative implementation of summing

```java
int acc = 0;
for (Integer element : asList(1, 2, 3)) {
    acc = acc + element;
}
assertEquals(6, acc);
```

In the imperative version, we can see that the accumulator is a variable we update on every loop iteration. We also update it by adding the element. The loop is external to the collection and all updates to the variable are managed manually.

### 3.3.8 PUTTING OPERATIONS TOGETHER

With so many different operations related to the Stream interface, it can sometimes seem like you’re wandering around a labyrinth looking for what you want. So let’s work through a problem and see how it breaks down into simple Stream operations.

Our first problem to solve is, for a given album, to find the nationality of every band playing on that album. The artists who play each track can be solo artists or they can be in a band. We’re going to use domain knowledge and artistic license to pretend that a band is really an artist whose name begins with The. This isn’t exactly right, but it’s pretty close!

The first thing to recognize is that the solution isn’t just the simple application of any individual API call. It’s not transforming the values like a map, it’s not filtering, and it’s not just getting a single value out of a Stream at the end. We can break the problem down into parts:

1. Get all the artists for an album.
2. Figure out which artists are bands.
3. Find the nationalities of each band.
4. Put together a set of these values.

Now it’s easier to see how these steps fit into the API:

1. There’s a nice getMusicians method on our Album class that returns a Stream.
2. We use filter to trim down the artists to include only bands.
3. We use map to turn the band into its nationality.
4. We use collect(toList()) to put together a list of these nationalities.

When we put everything together, it ends up like this:

```java
Set<String> origins = album.getMusicians()
                           .filter(artist -> artist.getName().startsWith("The"))
                           .map(artist -> artist.getNationality())
                           .collect(toSet());
```

This example shows the idiom of chaining operations a bit more clearly. The calls to musicians, filter, and map all return Stream objects, so they are lazy, while the collect method is eager. The map method is another function that takes just a lambda and whose purpose is to apply the function to every element in the Stream, returning a new Stream.

Our domain class here is actually quite convenient for us, in that it returns a Stream when we want to get a list of the musicians on our album. In your existing domain classes, you probably don’t have a method that returns streams—you return existing collection classes such as List or Set. This is OK; all you need to do is call the stream method on your List or Set.

Now is probably a good time to think about whether you really want to expose List and Set objects in your domain model, though. Perhaps a Stream factory would be a better choice. The big win of only exposing collections via Stream is that it better encapsulates your domain model’s data structure. It’s impossible for any use of your domain classes to affect the inner workings of your List or Set simply by exposing a Stream.

It also encourages users of your domain class to write code in a more modern Java 8 style. It’s possible to incrementally refactor to this style by keeping your existing getters and adding new Stream-returning getters. Over time, you can rewrite your legacy code until you’ve finally deleted all getters that return a List or Set. This kind of refactoring feels really good once you’ve cleared out all the legacy code!

## 3.4 Refactoring Legacy Code

Having talked a bit about refactoring already, let’s look at an example of some legacy collections code that uses loops to perform a task and iteratively refactor it into a stream-based implementation. At each step of the refactor, the code continues to pass its tests, though you’ll either have to trust me on that one or test it yourself!

This example finds the names of all tracks that are over a minute in length, given some albums. Our legacy code is shown in Example 3-19. We start off by initializing a Set that we’ll store all the track names in. The code then iterates, using a for loop, over all the albums, then iterates again over all the tracks in an album. Once we’ve found a track, we check whether the length is over 60 seconds, and if it is the name gets added to a Set of names.

Example 3-19. Legacy code finding names of tracks over a minute in length

```java
public Set<String> findLongTracks(List<Album> albums) {
    Set<String> trackNames = new HashSet<>();
    for(Album album : albums) {
        for (Track track : album.getTrackList()) {
            if (track.getLength() > 60) {
                String name = track.getName();
                trackNames.add(name);
            }
        }
    }
    return trackNames;
}
```

We’ve stumbled across this code in our code base and noticed that it has a couple of nested loops. It’s not quite clear what the purpose of this code is just from looking at it, so we decide to undertake our refactor. (There are lots of different approaches to refactoring legacy code for using streams—this is just one. In fact, once you are more familiar with the API itself, it’s pretty likely that you won’t need to proceed in such small steps. It serves educational purposes here to go a bit slower than you would in your professional job.)

The first thing that we’re going to change is the for loops. We’ll keep their bodies in the existing Java coding style for now and move to using the forEach method on Stream. This can be a pretty handy trick for intermediate refactoring steps. Let’s use the stream method on our album list in order to get the first stream. It’s also good to remember from the previous section that our domain already has the getTracks method on the album, which provides us a Stream of tracks. The code after we’ve completed step 1 is listed in Example 3-20.

Example 3-20. Refactor step 1: finding names of tracks over a minute in length

```java
public Set<String> findLongTracks(List<Album> albums) {
    Set<String> trackNames = new HashSet<>();
    albums.stream()
          .forEach(album -> {
              album.getTracks()
                   .forEach(track -> {
                       if (track.getLength() > 60) {
                           String name = track.getName();
                           trackNames.add(name);
                       }
                   });
          });
    return trackNames;
}
```

In step 1, we moved to using streams, but we didn’t really get their full potential. In fact, if anything the code is even less pretty than it was to begin with—d’oh! So, it’s high time we introduced a bit more stream style into our coding. The inner forEach call looks like a prime target for refinement.

We’re really doing three things here: finding only tracks over a minute in length, getting their names, and adding their names into our name Set. That means we need to call three Stream operations in order to get the job done. Finding tracks that meet a criterion sounds like a job for filter. Transforming tracks into their names is a good use of map. For the moment we’re still going to add the tracks to our Set, so our terminal operation will still be a forEach. If we split out the inner forEach block, we end up with Example 3-21.

Example 3-21. Refactor step 2: finding names of tracks over a minute in length

```java
public Set<String> findLongTracks(List<Album> albums) {
    Set<String> trackNames = new HashSet<>();
    albums.stream()
          .forEach(album -> {
              album.getTracks()
                   .filter(track -> track.getLength() > 60)
                   .map(track -> track.getName())
                   .forEach(name -> trackNames.add(name));
          });
    return trackNames;
}
```

Now we’ve replaced our inner loop with something a bit more streamy, but we still have this pyramid of doom in our code. We don’t really want to have nested stream operations; we want one simple and clean sequence of method calls.

What we really want to do is find a way of transforming our album into a stream of tracks. We know that whenever we want to transform or replace code, the operation to use is map. This is the more complex case of map, flatMap, for which the output value is also a Stream and we want them merged together. So, if we replace that forEach block with a flatMap call, we end up at Example 3-22.

Example 3-22. Refactor step 3: finding names of tracks over a minute in length

```java
public Set<String> findLongTracks(List<Album> albums) {
    Set<String> trackNames = new HashSet<>();

    albums.stream()
          .flatMap(album -> album.getTracks())
          .filter(track -> track.getLength() > 60)
          .map(track -> track.getName())
          .forEach(name -> trackNames.add(name));

    return trackNames;
}
```

That looks a lot better, doesn’t it? Instead of two nested for loops, we’ve got a single clean sequence of method calls performing the entire operation. It’s not quite there yet, though. We’re still creating a Set by hand and adding every element in at the end. We really want the entire computation to just be a chain of Stream calls.

I haven’t yet shown you the recipe for this transformation, but you’ve met one of its friends. Just as you can use collect(toList()) to build up a List of values at the end, you can also use collect(toSet()) to build up a Set of values. So, we replace our final forEach call with this collect call, and we can now delete the trackNames variable, arriving at Example 3-23.

Example 3-23. Refactor step 4: finding names of tracks over a minute in length

```java
public Set<String> findLongTracks(List<Album> albums) {
    return albums.stream()
                 .flatMap(album -> album.getTracks())
                 .filter(track -> track.getLength() > 60)
                 .map(track -> track.getName())
                 .collect(toSet());
}
```

In summary, we’ve taken a snippet of legacy code and refactored it to use idiomatic streams. At first we just converted to introduce streams and didn’t introduce any of the useful operations on streams. At each subsequent step, we moved to a more idiomatic coding style. One thing that I haven’t mentioned thus far but that was very helpful when actually writing the code samples is that at each step of the way I continued to run unit tests in order to make sure the code worked. Doing so is very helpful when refactoring legacy code.

## 3.5 Multiple Stream Calls

Rather than chaining the method calls, you could force the evaluation of each function individually following a sequence of steps. Please don’t do this. Example 3-24 shows our earlier origins of bands example written in that style. The original example is shown in Example 3-25 in order to make the comparison easier.

Example 3-24. Stream misuse

```java
List<Artist> musicians = album.getMusicians()
                              .collect(toList());

List<Artist> bands = musicians.stream()
                              .filter(artist -> artist.getName().startsWith("The"))
                              .collect(toList());

Set<String> origins = bands.stream()
                           .map(artist -> artist.getNationality())
                           .collect(toSet());
```

Example 3-25. Idiomatically chained stream calls

```java
Set<String> origins = album.getMusicians()
                           .filter(artist -> artist.getName().startsWith("The"))
                           .map(artist -> artist.getNationality())
                           .collect(toSet());
```

There are several reasons why the version in Example 3-24 is worse than the idiomatic, chained version:

- It’s harder to read what’s going on because the ratio of boilerplate code to actual business logic is worse.
- It’s less efficient because it requires eagerly creating new collection objects at each intermediate step.
- It clutters your method with meaningless garbage variables that are needed only as intermediate results.
- It makes operations harder to automatically parallelize.

Of course, if you’re writing your first few Stream-based examples, it’s perfectly normal to write code that’s a little bit like this. But if you find yourself writing blocks of operations like this often, you should stand back and see whether you can refactor them into a more concise and readable form.

NOTE

If at this stage you feel uncomfortable with the amount of method chaining in the API, that’s entirely natural. With more experience and more time these concepts will begin to feel quite natural, and it’s not a reason to write Java code that splits up chains of operations as in Example 3-24. Ensuring that you format the code line by line, as you would when using the builder pattern, will boost your comfort level as well.

## 3.6 Higher-Order Functions

What we’ve repeatedly encountered throughout this chapter are what functional programmers call higher-order functions. A higher-order function is a function that either takes another function as an argument or returns a function as its result. It’s very easy to spot a higher-order function: just look at its signature. If a functional interface is used as a parameter or return type, you have a higher-order function.

map is a higher-order function because its mapper argument is a function. In fact, nearly all the functions that we’ve encountered on the Stream interface are higher-order functions. In our earlier sorting example, we also used the comparing function. comparing not only took another function in order to extract an index value, but also returns a new Comparator. You might think of a Comparator as an object, but it has only a single abstract method, so it’s a functional interface.

In fact, we can make a stronger statement than that. Comparator was invented when a function was needed, but all Java had at the time was objects, so we made a type of class—an anonymous class—that we could treat like a function. Being an object was always accidental. Functional interfaces are a step in the direction that we actually want.

## 3.7 Good Use of Lambda Expressions

When I first introduced lambda expressions, I gave the example of a callback that printed something out. That’s a perfectly valid lambda expression, but it’s not really helping us write simpler and more abstract code because it’s still telling the computer to perform an operation. Removing the boilerplate was nice, but it’s not the only improvement we get with lambda expressions in Java 8.

The concepts introduced in this chapter let us write simpler code, in the sense that they describe operations on data by saying what transformation is made rather than how the transformation occurs. This gives us code that has less potential for bugs and expresses the programmer’s intent directly.

Another aspect of getting to the what and not the how is the idea of a side effect–free function. These are important because we can understand the full implications of what the functions are doing just by looking at what values they return.

Functions with no side effects don’t change the state of anything else in the program or the outside world. The first lambda expression in this book had side effects because it printed some output on the console—an observable side effect of the function. What about the following example?

```java
    private ActionEvent lastEvent;

    private void registerHandler() {
        button.addActionListener((ActionEvent event) -> {
            this.lastEvent = event;
        });
    }
```

Here we save away the event parameter into a field. This is a more subtle way of generating a side effect: assigning to variables. You may not see it directly in the output of your program, but it does change the program’s state. There are limits to what Java lets you do in this regard. Take a look at the assignment to localEvent in this code snippet:

```java
ActionEvent localEvent = null;
button.addActionListener(event -> {
    localEvent = event;
});
```

This example tries to assign the same event parameter into a local variable. There’s no need to send me errata emails—I know this won’t actually compile! That’s actually a deliberate choice on behalf of the designers: an attempt to encourage people to use lambda expressions to capture values rather than capturing variables. Capturing values encourages people to write code that is free from side effects by making it harder to do so. As mentioned in Chapter 2, even though local variables don’t need the final keyword in order to be used in lambda expressions, they still need to be effectively final.

Whenever you pass lambda expressions into the higher-order functions on the Stream interface, you should seek to avoid side effects. The only exception to this is the forEach method, which is a terminal operation.

## 3.8 Key Points

- Internal iteration is a way of iterating over a collection that delegates more control over the iteration to the collection.
- A Stream is the internal iteration analogue of an Iterator.
- Many common operations on collections can be performed by combining methods on Stream with lambda expressions.

## 3.9 Exercises

NOTE

You can find the answers to these exercises on GitHub.

Common Stream operations. Implement the following:

A function that adds up numbers, i.e., `int addUp(Stream<Integer> numbers)`

A function that takes in artists and returns a list of strings with their names and places of origin

A function that takes in albums and returns a list of albums with at most three tracks

Iteration. Convert this code sample from using external iteration to internal iteration:

```java
    int totalMembers = 0;
    for (Artist artist : artists) {
        Stream<Artist> members = artist.getMembers();
        totalMembers += members.count();
    }
```

Evaluation. Take a look at the signatures of these Stream methods. Are they eager or lazy?

```java
boolean anyMatch(Predicate<? super T> predicate);
Stream<T> limit(long maxSize);
```

Higher-order functions. Are these Stream functions higher order, and why?

```java
boolean anyMatch(Predicate<? super T> predicate);
Stream<T> limit(long maxSize);
```

Pure functions. Are these lambda expressions side effect-free, or do they mutate state?

```
x -> x + 1
```

Here’s the example code:

```java
AtomicInteger count = new AtomicInteger(0);
List<String> origins = album.musicians()
                            .forEach(musician -> count.incAndGet();)
```

The lambda expression passed into forEach in the example.

Count the number of lowercase letters in a String (hint: look at the chars method on String).

Find the String with the largest number of lowercase letters from a `List<String>`. You can return an `Optional<String>` to account for the empty list case.

## 3.10 Advanced Exercises

Write an implementation of the Stream function map using only reduce and lambda expressions. You can return a List instead of a Stream if you want.

Write an implementation of the Stream function filter using only reduce and lambda expressions. Again, you can return a List instead of a Stream if you want.
