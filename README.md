**_This project is still WIP_**

Data transfer between web browser and server are usually done with JSON data, which is in text format. This library helps to create a simple binary table format that can be sent/received to/from server. The main advantage of data transfer using binary format is the size.

BufferTable aims to be used as the data transfer for web (like REST), replacing JSON data.

# Why?
- It is tiny (<10KB for js source code).
- It is really easy to use.

# Supported Languages
- NodeJS
- Web (_coming soon_)
- C++ (_planned_)
- Go (_planned_)
- Rust (_planned_)

# Installation and Usage
Please go to specific language directory for instruction.

# FAQ
**Q: Why only a table?**  
A: Because this library aims to be simple to use. It is also much easier to develop than having a complex structure. Also, I'd argue that a table is all we need for almost all cases. _Link to explanation coming soon_

**Q: Why not just use Protobuf?**  
A: Protobuf is very great, and BufferTable is actually inspired by Protobuf. But Protobuf is heavy, hard to use, and need a compilation step. Of course that last one is not a weakness at all. If you need all the feature of Protobuf, then by all means use it.

**Q: What about lightweight alternative like FlatBuffers or Capt'n Proto?**  
A: BufferTable is still more lightweight, and easier to use.

# Contributing
_coming soon_