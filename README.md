# Strings Decoder

This is an extremely hacked together tool.

**This tool does not promise an executable bundle, it may or may not be runnable for any given patch.™**

To run:

- `npm i`
- Copy your `main.bundle.js` into the root folder.
- `npm start`

## Example:

<table>
<tr>
<td> Before <td> After </td>
</tr>
<tr>
<td>

```javascript
(this[_0x273dda(0x733)] = 0x1),
(this["speed"] = 0x1),
(this["cooldown"] = 0x1),
(this[_0x273dda(0x736)] = 0x0),
(this[_0x273dda(0x98c)] = 0x1),
(this["growth"] = 0x1),
(this[_0x273dda(0xa4c)] = 0x1),
(this[_0x273dda(0x717)] = 0x1),
```

</td>
<td>

```javascript
(this["area"] = 0x1),
(this["speed"] = 0x1),
(this["cooldown"] = 0x1),
(this["amount"] = 0x0),
(this["moveSpeed"] = 0x1),
(this["growth"] = 0x1),
(this["duration"] = 0x1),
(this["luck"] = 0x1),
```

</td>
</tr>
</table>


## How it works:
This tool traverses the AST of the bundle via [jscodeshift](https://github.com/facebook/jscodeshift) and determines/assumes the following:
- There are any number of functions at root level, one of which returns a string given an integer.
- There are variable declarations for that string function. The references may be first or nth order.
- The bundle is runnable in node with some modification.

Two modifications to the source are made during the first stage after the string functions have been found.

1. `self` and `window` are renamed to `global`
2. A global reference to the possible string functions is assigned in the source.

The source is then eval'd and the possible functions are called and filtered by their output.

After the base function is determined, the source is re-crawled and the instances of the found variables are replaced with their literal string.