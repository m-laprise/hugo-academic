(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var D = {
    agents: [[280.8,124.4],[409,107.4],[223.5,310.3],[88.8,153.6],[475.5,119.5],[359.6,154.4],[266.8,244.7],[86.8,299.5],[202.6,63.2],[422,228.9],[458.6,279.4],[357,246.9],[47.6,73.6],[149.2,120.7],[168.5,221.4],[325.8,71.5]],
    broker: [266,168],
    hilite: 7,
    baselineY: 502,
    brokerBarX: 150,
    agentBarX: 372,
    tickW: 98,
    tickH: 3.4,
    gap: 1.1,
    maxTicks: 28,
    interval: 900,
    force: [2,8,15,21,26],
    preEdges: 5,
    brokeredPattern: [true,false,true,true,false,true,false,true]
  };

  function svgEl(name, attrs) {
    var node = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  function pairKey(a, b) {
    return a < b ? a + "-" + b : b + "-" + a;
  }

  document.querySelectorAll("[data-tb-abm]").forEach(function (root) {
    var svg = root.querySelector("svg");
    var edges = root.querySelector("[data-abm-edges]");
    var nodes = root.querySelector("[data-abm-nodes]");
    var brokerBar = root.querySelector("[data-abm-broker-bar]");
    var clientBar = root.querySelector("[data-abm-client-bar]");
    var brokerCount = root.querySelector("[data-abm-broker-count]");
    var clientCount = root.querySelector("[data-abm-client-count]");
    var toggle = root.querySelector("[data-abm-toggle]");
    var replay = root.querySelector("[data-abm-replay]");
    var timer = null;
    var running = false;
    var started = false;
    var resumeWhenVisible = false;
    var made = [];
    var pool = [];
    var brokerTotal = 0;
    var clientTotal = 0;
    var matchIndex = 0;
    var nodeEls = [];
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildScene() {
      edges.innerHTML = "";
      nodes.innerHTML = "";
      brokerBar.innerHTML = "";
      clientBar.innerHTML = "";
      nodeEls = [];

      D.agents.forEach(function (point, index) {
        var circle = svgEl("circle", {cx:point[0], cy:point[1], r:8});
        circle.classList.add("tb-abm-client");
        nodes.appendChild(circle);
        nodeEls[index] = circle;
      });

      var selected = D.agents[D.hilite];
      var ring = svgEl("circle", {cx:selected[0], cy:selected[1], r:13});
      ring.classList.add("tb-abm-highlight-ring");
      nodes.appendChild(ring);
      var label = svgEl("text", {x:selected[0], y:selected[1] + 31, "text-anchor":"middle"});
      label.textContent = "one agent";
      nodes.appendChild(label);

      var brokerNode = svgEl("circle", {cx:D.broker[0], cy:D.broker[1], r:18});
      brokerNode.classList.add("tb-abm-broker");
      nodes.appendChild(brokerNode);
    }

    function buildPool() {
      pool = [];
      for (var i = 0; i < D.agents.length; i += 1) {
        for (var j = i + 1; j < D.agents.length; j += 1) pool.push([i,j]);
      }
      for (var k = pool.length - 1; k > 0; k -= 1) {
        var randomIndex = Math.floor(Math.random() * (k + 1));
        var temporary = pool[k];
        pool[k] = pool[randomIndex];
        pool[randomIndex] = temporary;
      }
    }

    function addPermanentEdge(pair) {
      var a = D.agents[pair[0]];
      var b = D.agents[pair[1]];
      var line = svgEl("line", {x1:a[0], y1:a[1], x2:b[0], y2:b[1]});
      line.classList.add("tb-abm-edge");
      edges.appendChild(line);
      return line;
    }

    function reset() {
      window.clearTimeout(timer);
      buildScene();
      buildPool();
      made = [];
      brokerTotal = 0;
      clientTotal = 0;
      matchIndex = 0;
      brokerCount.textContent = "0";
      clientCount.textContent = "0";
      toggle.textContent = "Pause";
      toggle.disabled = false;

      for (var i = 0; i < D.preEdges && pool.length; i += 1) {
        var pair = pool.pop();
        addPermanentEdge(pair);
        made.push(pairKey(pair[0], pair[1]));
      }
    }

    function halo(cx, cy, radius, isBrokered) {
      var haloNode = svgEl("circle", {cx:cx, cy:cy, r:radius, opacity:0.32});
      haloNode.classList.add("tb-abm-halo");
      if (!isBrokered) haloNode.classList.add("tb-abm-halo--direct");
      nodes.appendChild(haloNode);
      window.requestAnimationFrame(function () {
        haloNode.style.transition = "opacity .6s, r .6s";
        haloNode.setAttribute("r", radius * 1.9);
        haloNode.setAttribute("opacity", "0");
      });
      window.setTimeout(function () {
        if (haloNode.parentNode) haloNode.parentNode.removeChild(haloNode);
      }, 680);
    }

    function addObservation(group, total, x, isBroker) {
      var y = D.baselineY - total * (D.tickH + D.gap);
      var rect = svgEl("rect", {x:x - D.tickW / 2, y:y - D.tickH, width:D.tickW, height:D.tickH, rx:1.4, opacity:0});
      rect.classList.add(isBroker ? "tb-abm-tick--broker" : "tb-abm-tick--client");
      group.appendChild(rect);
      window.requestAnimationFrame(function () {
        rect.style.transition = "opacity .3s";
        rect.setAttribute("opacity", "1");
      });
    }

    function lightNode(index, isBrokered) {
      var circle = nodeEls[index];
      var activeClass = isBrokered ? "is-active" : "is-direct";
      circle.classList.add(activeClass);
      window.setTimeout(function () { circle.classList.remove(activeClass); }, 700);
      var point = D.agents[index];
      halo(point[0], point[1], 11, isBrokered);
    }

    function choosePair() {
      var pair;
      var isNew = false;

      if (D.force.indexOf(matchIndex) >= 0) {
        var other;
        do { other = Math.floor(Math.random() * D.agents.length); } while (other === D.hilite);
        pair = [D.hilite, other];
        isNew = made.indexOf(pairKey(pair[0], pair[1])) < 0;
      } else if ((made.length < 3 || Math.random() < 0.6) && pool.length) {
        pair = pool.pop();
        while (made.indexOf(pairKey(pair[0], pair[1])) >= 0 && pool.length) pair = pool.pop();
        isNew = true;
      } else if (made.length) {
        var existing = made[Math.floor(Math.random() * made.length)].split("-");
        pair = [+existing[0], +existing[1]];
      } else if (pool.length) {
        pair = pool.pop();
        isNew = true;
      }
      return pair ? {
        pair:pair,
        isNew:isNew,
        isBrokered:D.brokeredPattern[matchIndex % D.brokeredPattern.length]
      } : null;
    }

    function doMatch() {
      if (!running) return;
      var selected = choosePair();
      if (!selected) {
        timer = window.setTimeout(doMatch, D.interval);
        return;
      }

      var pair = selected.pair;
      var a = pair[0];
      var b = pair[1];
      var pointA = D.agents[a];
      var pointB = D.agents[b];
      var line = svgEl("line", {x1:pointA[0], y1:pointA[1], x2:pointB[0], y2:pointB[1], opacity:0.95});
      line.classList.add("tb-abm-edge-flash");
      if (!selected.isBrokered) line.classList.add("tb-abm-edge-flash--direct");
      edges.appendChild(line);

      if (selected.isNew) {
        made.push(pairKey(a, b));
        window.setTimeout(function () {
          line.style.transition = "stroke .7s, stroke-width .7s";
          line.classList.remove("tb-abm-edge-flash", "tb-abm-edge-flash--direct");
          line.classList.add("tb-abm-edge");
        }, 440);
      } else {
        window.setTimeout(function () {
          line.style.transition = "opacity .55s";
          line.setAttribute("opacity", "0");
          window.setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 600);
        }, 300);
      }

      lightNode(a, selected.isBrokered);
      lightNode(b, selected.isBrokered);
      if (selected.isBrokered) {
        halo(D.broker[0], D.broker[1], 20, true);
        brokerTotal += 1;
        brokerCount.textContent = String(brokerTotal);
        addObservation(brokerBar, brokerTotal, D.brokerBarX, true);
      }

      if (a === D.hilite || b === D.hilite) {
        clientTotal += 1;
        clientCount.textContent = String(clientTotal);
        addObservation(clientBar, clientTotal, D.agentBarX, false);
      }

      matchIndex += 1;
      if (matchIndex >= D.maxTicks) timer = window.setTimeout(restart, 2700);
      else timer = window.setTimeout(doMatch, D.interval);
    }

    function play() {
      if (running) return;
      running = true;
      toggle.textContent = "Pause";
      timer = window.setTimeout(doMatch, 250);
    }

    function pause() {
      running = false;
      window.clearTimeout(timer);
      toggle.textContent = "Play";
    }

    function restart() {
      running = false;
      window.clearTimeout(timer);
      svg.style.transition = "opacity .55s";
      svg.style.opacity = "0";
      window.setTimeout(function () {
        reset();
        svg.style.opacity = "1";
        play();
      }, 580);
    }

    toggle.addEventListener("click", function () { running ? pause() : play(); });
    replay.addEventListener("click", restart);
    reset();

    if (reducedMotion) {
      toggle.textContent = "Play";
      return;
    }

    function begin() {
      if (!started) {
        started = true;
        running = true;
        timer = window.setTimeout(doMatch, 600);
      }
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!started) begin();
            else if (resumeWhenVisible) {
              resumeWhenVisible = false;
              play();
            }
          } else if (running) {
            resumeWhenVisible = true;
            pause();
          }
        });
      }, {threshold:0.2});
      observer.observe(root);
    } else {
      begin();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && running) {
        resumeWhenVisible = true;
        pause();
      } else if (!document.hidden && resumeWhenVisible) {
        resumeWhenVisible = false;
        play();
      }
    });
  });
})();
