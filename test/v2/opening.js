(function(){
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }, seg = function(p,a,b){ return clamp((p - a) / (b - a)); };
  var ease = function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }, out = function(t){ return 1 - Math.pow(1 - t, 3); };
  var back = function(t){ var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  var hero = document.getElementById('opening'), $ = function(q){ return hero.querySelector(q); }, $$ = function(q){ return [].slice.call(hero.querySelectorAll(q)); };
  function prog(){ var r = hero.getBoundingClientRect(), travel = r.height - innerHeight; return travel > 4 ? clamp(-r.top / travel) : 0; }

  // the paper backing behind the letters: two rings of shadows in the paper colour, so the text stays real text
  var sign = document.getElementById('backing'), sh = [];
  [.08, .16, .24, .32].forEach(function(r){ for (var a = 0; a < 28; a++) { var th = a / 28 * Math.PI * 2; sh.push((Math.cos(th) * r).toFixed(3) + 'em ' + (Math.sin(th) * r).toFixed(3) + 'em 0 #efe4cf'); } });
  sign.style.textShadow = sh.join(',');

  var rig = document.getElementById('rig'), rose = $('.pup.rose'), daddy = $('.pup.daddy'), witch = $('.pup.witch'),
      foxy = $('.pup.foxy'), mummy = $('.pup.mummy'), biscuit = $('.pup.biscuit'),
      plq = { rose:$('.plq.rose'), foxy:$('.plq.foxy'), daddy:$('.plq.daddy'), witch:$('.plq.witch'), mummy:$('.plq.mummy'), biscuit:$('.plq.biscuit') }, rot = { rose:-2, foxy:2, daddy:-3, witch:2.5, badger:-2, mummy:2.5, biscuit:-2 },
      rows = $$('.fl.rowa, .fl.rowb, .fl.rowc'), grass = $('.fl.grass'), cottage = $('.fl.cottage'), mush = $('.fl.mush'), pot = $('.fl.pot'),
      backdrop = document.getElementById('backdrop'), hangs = $$('.hang'), planet = $('.fl.planet'), rocket = $('.fl.rocket'),
      slips = $$('#billIn p'), bill = document.getElementById('bill'), ufo = $('.fl.ufo'), sat = $('.fl.sat'), planet2 = $('.fl.planet2'), comet = $('.fl.comet'), helms = $$('.helm'), space = document.getElementById('space'), cue = document.getElementById('bcue'), T0 = performance.now();
  var narrow = matchMedia('(max-width:760px)').matches;
  for (var xi = 0; xi < (narrow ? 0 : 10); xi++) { var hg = document.createElement('div'); hg.className = 'hang'; hg.style.left = (3 + (xi * 37 + 11) % 94) + '%'; hg.dataset.l = 8 + (xi * 23) % 58; hg.dataset.s = (2.2 + (xi % 4) * .7).toFixed(1);
    hg.innerHTML = '<i></i><img src="/test/assets-v3/star.webp" alt="">'; space.insertBefore(hg, space.firstChild); }
  hangs = $$('.hang');
  hangs.forEach(function(h){ h.firstChild.style.height = h.dataset.l + 'vh'; h.lastChild.style.height = h.dataset.s + 'vh'; });
  function tagIn(el, key, k){ el.style.opacity = clamp(k * 3); el.style.transform = 'translateY(' + ((1 - out(k)) * 10) + 'px) rotate(' + rot[key] + 'deg)'; }
  rot.mummy = 2.5; rot.rose = -2; rot.foxy = 2;

  var curW = -1, billInEl = document.getElementById('billIn');
  var underEl = hero.querySelector('.under');
  function frame(now){
    var t = reduced ? 0 : (now - T0) / 1000, p = reduced ? 1 : prog(), P = function(a, b){ return seg(p, a, b); }, k;
    cue.style.opacity = 1 - P(0, .03);
    if (underEl) { underEl.style.opacity = 1 - P(.025, .055); underEl.style.pointerEvents = p > .04 ? 'none' : 'auto'; }
    var sway = Math.sin(t * .9) * .5;
var drop = reduced ? 1 : clamp((t - .15) / 1.3), settle = Math.sin(drop * Math.PI * 3) * (1 - drop) * 4;
    rig.style.transform = 'translateY(' + ((1 - back(drop)) * -75) + 'vh) rotate(' + (sway * .35 + settle + Math.sin(P(.62, .8) * Math.PI * 3) * (1 - P(.62, .8)) * 1.6) + 'deg)';
    var idle = reduced ? 0 : (1 - P(.005, .035)) * clamp((t - 1.6) / .5), pk = function(ph, amt){ var v = Math.sin(t * 1.25 + ph); return idle * amt * (v > 0 ? v * v : 0); };

    // the cast come out from behind the letters, one at a time
    k = Math.max(back(P(.04, .1)), pk(0, .5)); rose.style.opacity = Math.max(P(.04, .055), idle > 0 ? 1 : 0); rose.style.transform = 'translateY(' + ((1 - k) * .9) + 'em) rotate(' + ((1 - k) * 6) + 'deg)'; tagIn(plq.rose, 'rose', P(.08, .12));
    k = Math.max(back(P(.11, .16)), pk(-.5, .55)); foxy.style.opacity = Math.max(P(.11, .12), idle > 0 ? 1 : 0); foxy.style.transform = 'translateY(' + ((1 - k) * .7) + 'em) rotate(' + ((1 - k) * -10 + 4) + 'deg)'; tagIn(plq.foxy, 'foxy', P(.14, .18)); if (narrow) plq.foxy.style.opacity = clamp(P(.14, .18) * 3) * (1 - P(.83, .855));
    k = Math.max(back(P(.19, .26)), pk(2.2, .5)); daddy.style.opacity = Math.max(P(.19, .205), idle > 0 ? 1 : 0); daddy.style.transform = 'translateX(' + ((1 - k) * .9) + 'em) rotate(' + (-14 + (1 - k) * 14 + Math.sin(t * 1.2) * .6) + 'deg)'; tagIn(plq.daddy, 'daddy', P(.24, .28));
    // the baddy arrives, and when the story changes she is thrown out and Mummy takes her place
    var chuck = P(.68, .78), c2 = chuck * chuck;
    k = Math.max(back(P(.29, .36)), pk(4.1, .45)); witch.style.opacity = Math.max(P(.29, .305), idle > 0 ? 1 : 0) * (1 - P(.77, .78));
    witch.style.transform = 'translate(' + ((1 - k) * -.9 + c2 * 5) + 'em,' + (-Math.sin(chuck * Math.PI * .75) * 3.2 + c2 * 1.5) + 'em) rotate(' + (13 - (1 - k) * 13 + Math.sin(t * 1.1 + 1) * .6 * (1 - chuck) + chuck * 560) + 'deg)';
    plq.witch.style.opacity = clamp(P(.34, .38) * 3) * (1 - P(.66, .69)); plq.witch.style.transform = 'translateY(' + ((1 - out(P(.34, .38))) * 10 + P(.66, .69) * 14) + 'px) rotate(' + (2.5 + P(.66, .69) * 14) + 'deg)';
    k = back(P(.8, .87)); mummy.style.opacity = P(.8, .815); mummy.style.transform = 'translateX(' + ((1 - k) * -.9) + 'em) rotate(' + (11 - (1 - k) * 11 + Math.sin(t * 1.1 + 1) * .5) + 'deg)'; tagIn(plq.mummy, 'mummy', P(.85, .89));
    // Biscuit takes a perch on the sign once the story moves to space
    k = P(.86, .93); biscuit.style.opacity = P(.86, .87); biscuit.style.transform = 'translateY(' + ((1 - back(k)) * -2.2) + 'em)'; tagIn(plq.biscuit, 'biscuit', P(.92, .96));

    // world one rises from the floor; world two drops from the flies while world one sinks
    var sink = ease(P(.66, .8));
    k = out(P(.48, .56)); grass.style.transform = 'translateY(' + ((1 - k) * 50 + sink * 50) + 'vh)';
    rows.forEach(function(r, n){ k = out(P(.49 + n * .012, .58 + n * .012)); r.style.transform = 'translateY(' + ((1 - k) * 70 + sink * 80) + 'vh)'; });
    k = back(P(.53, .61)); cottage.style.transform = 'translateY(' + ((1 - k) * 60 + sink * 70) + 'vh) rotate(' + ((1 - k) * 6) + 'deg)';
    k = back(P(.57, .62)) * (1 - sink); mush.style.transform = 'scale(' + Math.max(k, 0) + ')'; mush.style.transformOrigin = '50% 100%';
    k = back(P(.58, .64)); pot.style.transform = 'translateY(' + ((1 - k) * 40 + sink * 60) + 'vh)';
    backdrop.style.transform = 'translateY(' + (-104 + out(P(.66, .78)) * 104) + '%)';
    hangs.forEach(function(h, n){ var ha = P(.72 + n * .011, .84 + n * .011); h.style.opacity = ha > 0 ? 1 : 0;
      h.style.transform = 'translateY(' + ((1 - out(ha)) * -90) + 'vh) rotate(' + (Math.sin(ha * 11) * 13 * (1 - ha) + Math.sin(t * .8 + n) * 1.3) + 'deg)'; });
    k = back(P(.78, .88)); planet.style.transform = 'translateY(' + ((1 - k) * 50) + 'vh) rotate(' + (Math.sin(t * .4) * 3) + 'deg)';
    k = P(.82, 1); rocket.style.opacity = k > 0 ? 1 : 0; rocket.style.transform = 'translate(' + (-20 + k * 125) + 'vw,' + (-k * 12 + Math.sin(k * 9) * 1.5) + 'vh)';

    // more of space: a satellite drifts in, a saucer bobs, a second planet, a comet crosses, and the cast get helmets
    k = out(P(.76, .87)); sat.style.transform = 'translate(' + ((1 - k) * -45) + 'vw,' + (Math.sin(t * .7) * .8) + 'vh) rotate(' + (-12 + Math.sin(t * .5) * 5) + 'deg)';
    k = back(P(.8, .9)); ufo.style.transform = 'translate(' + ((1 - k) * 45) + 'vw,' + (Math.sin(t * 1.3) * 1.3) + 'vh) rotate(' + (Math.sin(t * .9) * 4) + 'deg)';
    k = back(P(.82, .9)); planet2.style.transform = 'scale(' + Math.max(k, 0) + ')';
    k = P(.85, 1); comet.style.opacity = k > 0 && k < 1 ? 1 : 0; comet.style.transform = 'translate(' + (-22 + k * 140) + 'vw,' + (-22 + k * 105) + 'vh)';
    k = back(P(.88, .95)); helms.forEach(function(h){ h.style.opacity = clamp(k * 2); h.style.transform = 'scale(' + Math.max(k, 0) + ')'; });

    // the billing card under the sign flips over when the story changes; one side is always fully readable
    var w = p < .5 ? 0 : p < .7 ? 1 : p < .955 ? 2 : 3;
    if (w !== curW) { slips.forEach(function(s, n){ s.classList.toggle('off', n === curW && curW >= 0); s.classList.toggle('on', n === w); }); billInEl.classList.remove('kick'); void billInEl.offsetWidth; billInEl.classList.add('kick'); curW = w; }
    bill.style.transform = 'rotate(' + (-1 + Math.sin(t * .8 + 1) * .7) + 'deg)';
    requestAnimationFrame(frame);
  }
  var stageEl = document.getElementById('bstage'), sw = document.getElementById('signwrap');
  function placeBill(){ if (!narrow) return; var H = stageEl.offsetHeight, gap = Math.max(H - bill.offsetHeight - H * .03 - sw.offsetTop - sw.offsetHeight, 14);
    bill.style.top = (sw.offsetHeight + gap) + 'px'; bill.style.setProperty('--bth', (gap + 12) + 'px'); }
  placeBill(); addEventListener('resize', placeBill); addEventListener('load', placeBill); setTimeout(placeBill, 900);
  requestAnimationFrame(frame);
})();
