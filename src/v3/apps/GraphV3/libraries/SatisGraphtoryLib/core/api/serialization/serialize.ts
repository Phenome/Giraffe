import { GraphObject } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/objects/interfaces/GraphObject';
import { getSchemaForVersion } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/core/api/serialization/schema';
import { NodeTemplate } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/objects/Node/NodeTemplate';
import EdgeTemplate from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/objects/Edge/EdgeTemplate';
import {
  serializeEdge,
  serializeNode,
} from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/core/api/serialization/types';
import { deflateRaw } from 'pako';
import * as LZ from 'lz-string';
import { buffer2str } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/core/api/serialization/stringEncode';

const serializeGraphObjects = (objs: GraphObject[]) => {
  // const edgesToProcess: EdgeTemplate[] = [];
  const nodeIdToNumberMap = new Map<string, number>();
  const edgeIdToNumberMap = new Map<string, number>();

  // Reference to a number so we can edit it inside a function
  let nodeNumberId = [1];
  let edgeNumberId = [1];

  const root = getSchemaForVersion(process.env.REACT_APP_VERSION || '');

  const NodeType = root.lookupType('Node');

  const EdgeType = root.lookupType('Edge');

  const nodes = [];
  const edges = [];

  for (const obj of objs) {
    if (obj instanceof NodeTemplate) {
      for (const edge of [
        ...obj.anyConnections,
        ...obj.outputConnections,
        ...obj.inputConnections,
      ]) {
        if (!edgeIdToNumberMap.has(edge.id)) {
          const serializedEdge = serializeEdge(
            edge,
            nodeIdToNumberMap,
            edgeIdToNumberMap,
            nodeNumberId,
            edgeNumberId,
            EdgeType
          );

          edges.push(serializedEdge);
        }
      }

      const serializedNode = serializeNode(
        obj,
        nodeIdToNumberMap,
        edgeIdToNumberMap,
        nodeNumberId,
        edgeNumberId,
        NodeType
      );

      nodes.push(serializedNode);

      // const buffer1 = EdgeType.encode(serializedNode).finish();
      // const message1 = EdgeType.decode(buffer1);
      // console.log(EdgeType.toObject(message1, {
      //   enums: String,  // enums as string names
      //   longs: String,  // longs as strings (requires long.js)
      //   bytes: String,  // bytes as base64 encoded strings
      //   defaults: true, // includes default values
      //   arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
      //   objects: true,  // populates empty objects (map fields) even if defaults=false
      //   oneofs: true    // includes virtual oneof fields set to the present field's name
      // }));
    } else if (obj instanceof EdgeTemplate) {
      // edgesToProcess.push(obj);
      // ignore
      // const serializedEdge = serializeEdge(
      //   obj,
      //   nodeIdToNumberMap,
      //   edgeIdToNumberMap,
      //   nodeNumberId,
      //   edgeNumberId,
      //   EdgeType
      // );
      //
      // edges.push(serializedEdge);
      //
      // const buffer1 = EdgeType.encode(serializedEdge).finish();
      // const message1 = EdgeType.decode(buffer1);
      // console.log(EdgeType.toObject(message1, {
      //   enums: String,  // enums as string names
      //   longs: String,  // longs as strings (requires long.js)
      //   bytes: String,  // bytes as base64 encoded strings
      //   defaults: true, // includes default values
      //   arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
      //   objects: true,  // populates empty objects (map fields) even if defaults=false
      //   oneofs: true    // includes virtual oneof fields set to the present field's name
      // }));
    } else {
      throw new Error('Unimplemented serialization');
    }
  }

  const SaveData = root.lookupType('SGSave');

  const saveDataBase = {
    nodes,
    edges,
  };

  SaveData.verify(saveDataBase);
  SaveData.create(saveDataBase);
  // const message1 = SaveData.decode(buffer);
  // console.log(SaveData.toObject(message1, {
  //   enums: String,  // enums as string names
  //   longs: String,  // longs as strings (requires long.js)
  //   bytes: String,  // bytes as base64 encoded strings
  //   defaults: true, // includes default values
  //   arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
  //   objects: true,  // populates empty objects (map fields) even if defaults=false
  //   oneofs: true    // includes virtual oneof fields set to the present field's name
  // }));
  const data = SaveData.encode(saveDataBase).finish();

  const textForm = new TextDecoder('utf-8').decode(data);
  let compressedUint8Form = LZ.compressToUint8Array(textForm);

  let dataLength = compressedUint8Form.length;
  let compressionLevel = 0;

  for (let i = 0; i < 50; i++) {
    const newData = deflateRaw(data, { level: 9 });
    if (newData.length < dataLength) {
      compressedUint8Form = newData;
      dataLength = newData.length;
      compressionLevel++;
    } else {
      break;
    }
  }

  const tmp = buffer2str(compressedUint8Form, false);

  const stringForm = LZ.compressToBase64(tmp);

  // const uncompressedForm = LZ.decompressFromBase64(stringForm)!;
  // const decoded = new TextEncoder().encode(uncompressedForm);
  //
  // let dataEncoded = decoded;
  //
  // for (let i = 0; i < compressionLevel; i++) {
  //   dataEncoded = inflateRaw(dataEncoded);
  // }
  //
  // let encodedDecompress = LZ.decompressFromUint8Array(dataEncoded)!;
  //
  // const blah = new TextEncoder().encode(encodedDecompress);
  //
  // console.log(blah);

  console.log('Your save code:');
  console.log(
    JSON.stringify(
      { d: stringForm, c: compressionLevel, v: process.env.REACT_APP_VERSION },
      null,
      2
    )
  );

  return {
    d: stringForm,
    c: compressionLevel,
    v: process.env.REACT_APP_VERSION,
  };

  // {
  //   "d": "MgJQpwBgKAHQowEgIgAqADAauARgEwE22wBmAjtAE4EmAAAMADIA4AQIAYAwgBICgBwAMkAAgFXYAbgDEAoADQAtAwBqANgDEk8X0kAIkRwA2ADJEAOPgEIAqkwBmLNQBkASAGq0AKdOmAsQAwATogPABwRAAKPIQArlg8ADQAQABoEAB+oPwBW+JgATwAPAE+AGL8igFx4gAIPZwAsgEMAMoBU0xoaIA===",
  //   "c": 1,
  //   "v": "0.1.0"
  // }
};

export default serializeGraphObjects;
