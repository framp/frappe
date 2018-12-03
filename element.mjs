import * as assert from "./assert.mjs";
import * as A from "./arrow.mjs";

const setAttribute = key =>
  A.accum(
    null,
    (acc, val) =>
      acc && acc === val
        ? [acc, () => {}]
        : [val, parent => parent.setAttribute(key, val)]
  );

{
  ("Test: setAttribute");
  const nodeFail = {
    setAttribute: () => assert.fail("Called setAttribute when not needed")
  };
  const nodeWith = (key, val) => ({
    setAttribute: (k, v) => {
      assert.deepEqual(key, k);
      assert.deepEqual(val, v);
    }
  });
  setAttribute("class")("lolcat")[0]("gifcat")[1](nodeWith("class", "gifcat"));
  setAttribute("class")("lolcat")[1](nodeWith("class", "lolcat"));
  setAttribute("class")("lolcat")[0]("lolcat")[1](nodeFail);
}

const makeElement = type =>
  A.accum(
    null,
    (acc, nodeOps = []) => console.log(nodeOps.map(a => a.toString())) ||
      acc
        ? [
            acc,
            (parent, document, eventMapper, index = 0) => {
              const el = parent.childNodes[index];
              nodeOps.filter(Boolean).forEach((op, index) => op(el, document, index));
              return el;
            }
          ]
        : [
            type,
            (parent, document, eventMapper, index = 0) => {
              const el = document.createElement(type);
              nodeOps.filter(Boolean).forEach((op, index) => op(el, document, index));
              if (parent.childNodes[index]) {
                parent.replaceChild(parent.childNodes[index], el);
              } else {
                parent.appendChild(el);
              }
              return el;
            }
          ]
  );

{
  ("Test: makeElement");
  const document = {
    createElement: type => {
      const attributes = {};
      const childNodes = [];
      return {
        childNodes,
        attributes,
        tagName: type.toUpperCase(),
        appendChild: c => childNodes.push(c),
        replaceChild: (p, c) => {
          const index = childNodes.findIndex(n => n === p);
          if (index === -1)
            throw new Error("Not a valid element! How dare you!");
          childNodes[index] = c;
        },
        setAttribute: (k, v) => {
          attributes[k] = v;
        },
        getAttribute: k => attributes[k]
      };
    }
  };

  document.body = document.createElement("body");
  makeElement("div")()[1](document.body, document);
  assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
  document.body = document.createElement("body");
  makeElement("div")([makeElement("p")()[1]])[1](document.body, document);
  assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
  assert.deepEqual(document.body.childNodes[0].childNodes[0].tagName, "P");
  makeElement("div")([makeElement("p")()[1]])[0]([makeElement("span")()[1]])[1](
    document.body,
    document
  );
  assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
  assert.deepEqual(document.body.childNodes[0].childNodes[0].tagName, "SPAN");
}

export const h = (type, attribs = {}, childNodes = []) => {
  const attribsArrow = A.isArrow(attribs) 
    ? attribs 
    : A.fanout(Object.keys(attribs).map(key =>
        A.compose([setAttribute(key), A.constantify(attribs[key])])
      ));
  const childNodesArrow = A.isArrow(childNodes)
    ? childNodes
    : A.fanout(childNodes.map(A.constantify))
  return A.compose([
    makeElement(type),
    A.arr(([a, b]) => a.concat(b)),
    A.fanout([attribsArrow, childNodesArrow]),
  ]);
};

{
  ("Test: h");
  const document = {
    createElement: type => {
      const attributes = {};
      const childNodes = [];
      return {
        childNodes,
        attributes,
        tagName: type.toUpperCase(),
        appendChild: c => console.log('APPENDCHILD-' + type,c) || childNodes.push(c),
        replaceChild: (p, c) => {
          console.log('REPLACECHILD-' + type, p, c) 
          const index = childNodes.findIndex(n => n === p);
          if (index === -1)
            throw new Error("Not a valid element! How dare you!");
          childNodes[index] = c;
        },
        setAttribute: (k, v) => {
          console.log('SETATTRIBUTE-' + type, k, v)
          attributes[k] = v;
        },
        getAttribute: k => attributes[k]
      };
    }
  };
  document.body = document.createElement("body");
  h("div")()[1](document.body, document);
  assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
  h("div", { class: A.constant("test") }, [h("div")])()[1](
    document.body,
    document
  );
  assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
  assert.deepEqual(document.body.childNodes[0].attributes.class, "test");
  assert.deepEqual(document.body.childNodes[0].childNodes[0].tagName, "DIV");
  h("p", { class: "test2" }, [])()[1](document.body, document);
  assert.deepEqual(document.body.childNodes[0].tagName, "P");
  assert.deepEqual(document.body.childNodes[0].attributes.class, "test2");

  document.body = document.createElement("body");
  const countDown = A.accum(5, (acc, val) => [
    acc - 1,
    acc <= 0 ? "done" : "countdown-" + acc + "-" + val
  ]);
  const countDownLabel = h("p", { class: countDown }, []);
  const countDownResults = A.run(countDownLabel, [0, 1, 2, 3, 4, 5, 6]);
  const countDownExpected = [
    "countdown-5-0",
    "countdown-4-1",
    "countdown-3-2",
    "countdown-2-3",
    "countdown-1-4",
    "done",
    "done"
  ];
  countDownResults.forEach((fn, i) => {
    fn(document.body, document);
    assert.deepEqual(document.body.childNodes[0].tagName, "P");
    assert.deepEqual(document.body.childNodes[0].attributes.class, countDownExpected[i]);
  });

  document.body = document.createElement("body");
  const dynamicChildren = A.accum(0, (acc, val) => [
    acc + 1,
    A.fanout([ ...Array(acc+1) ].map((_, i) => 
      h('p', { class: `dynamic-${i}` })))()[1]
  ])
  const dynamicParent = h("div", {}, dynamicChildren);
  const dynamicResults = A.run(dynamicParent, [0, 1, 2, 3]);
  dynamicResults.forEach((fn, i) => {
    console.log(fn)
    fn(document.body, document);
    assert.deepEqual(document.body.childNodes[0].tagName, "DIV");
    console.log(';;;', document.body.childNodes[0].childNodes)
    //assert.deepEqual(document.body.childNodes[0].childNodes.length, i);
    //for (let j=0; j<i; j++) {
      //assert.deepEqual(document.body.childNodes[0].childNodes[i-1].tagName, 'P');
      //assert.deepEqual(document.body.childNodes[0].childNodes[i-1].attributes.class, `dynamic-${j}`);
    //}
  });
}

