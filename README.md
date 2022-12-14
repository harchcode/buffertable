# :warning: This project is deprecated.

**_This is just a fun project, use it at your own risk_**

Data transfer between web browser and server are usually done with JSON data, which is in text format. This library helps to create a simple binary table format that can be sent/received to/from server. The main advantage of data transfer using binary format is the size.

BufferTable aims to be used as the data transfer for web (like REST), replacing JSON data.

# Why?
- It is tiny (<10 KB minified for JS);

# Supported Languages
- NodeJS
- Web (_coming soon_)
- WebAssembly (_planned_)
- C++ (_planned_)

# Installation and Usage
Please go to specific language directory for instruction.

# Limitations and Caveats
- Table can only store 4GB (32 bit) size.
- A table can only have 256 columns.
- A string can only have 65k (16 bit) size (not the same as length, as 1 char's size can be more than 1 byte).
- Table columns cannot be changed once created.
- No error checking, so if you pass invalid value (i.e. you pass a string to a i32 type), no one knows what will happen :)

# FAQ
**Q: Why only a table?**  
A: Because this library aims to be simple to use. It is also much easier to develop than having a complex structure. Also, I'd argue that a table is all we need for almost all cases. _Link to explanation coming soon_

**Q: Why not just use Protobuf?**  
A: Protobuf is very great, and BufferTable is actually inspired by Protobuf. But Protobuf is heavy, hard to use, and need a compilation step. Of course that last one is not a weakness at all. If you need all the feature of Protobuf, then by all means use it.

**Q: What about lightweight alternative like FlatBuffers or Capt'n Proto?**  
A: BufferTable is still more lightweight, and easier to use.

# Contributing
_coming soon_
