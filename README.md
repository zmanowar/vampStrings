# Strings Decoder
**This will most likely not be a runnable bundle, mainly useful for investigation purposes... eventually, maybe™**


To run:
- `npm i`
- Copy your `main.bundle.js` into the root folder.
- `npm start`


## Example:

<table>
<tr>
<td> Bundle -></td> <td> VampStrings </td>
</tr>
<tr>
<td>

```javascript
[_0x465e1a(0x165)](_0x3a4d53) {
var _0x52511c = _0x465e1a;
super["Update"](_0x3a4d53),
    this[_0x52511c(0x309)][_0x52511c(0x524)](
    _0xd38b30[_0x52511c(0x6c0)]["Player"]
    ),
    this[_0x52511c(0x309)][_0x52511c(0x2a2)](
    _0xd38b30[_0x52511c(0x6c0)][_0x52511c(0x4da)][
        _0x52511c(0x7ac)
    ] -
        0.5 *
        _0xd38b30["Core"]["scene"]["renderer"][_0x52511c(0x797)]
    );
}
```

</td>
<td>

```javascript
["Update"](_0x3a4d53) {
    var getStringAt = getStringAt;
    super["Update"](_0x3a4d53),
        this["image"]["copyPosition"](
            _0xd38b30["Core"]["Player"]
        ),
        this["image"]["setDepth"](
            _0xd38b30["Core"]["Player"][
                "depth"
            ] -
            0.5 *
            _0xd38b30["Core"]["scene"]["renderer"]["height"]
        );
}
```

</td>
</tr>
</table>
