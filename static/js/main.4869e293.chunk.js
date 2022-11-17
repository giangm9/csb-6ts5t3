(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{10:function(t,n,e){},4:function(t,n,e){t.exports=e(5)},5:function(t,n,e){"use strict";e.r(n);var a=e(0),o=e.n(a),i=e(2),r=e.n(i),f=e(3),s=e.n(f),m=(e(10),"\n  #ifdef GL_ES\nprecision mediump float;\n#endif\n\n// uniform float iTime; \n \n// uniform float time;\n// uniform vec2 mouse;\n// uniform vec2 resolution;\n\n\n#define iterations 14\n#define formuparam2 0.79\n \n#define volsteps 5\n#define stepsize 0.290\n \n#define zoom 0.900\n#define tile   0.850\n#define speed2  0.10\n \n#define brightness 0.003\n#define darkmatter 0.400\n#define distfading 0.560\n#define saturation 0.800\n\n\n#define transverseSpeed zoom*2.0\n#define cloud 0.11 \n\n \nfloat triangle(float x, float a) { \n\tfloat output2 = 2.0*abs(  2.0*  ( (x/a) - floor( (x/a) + 0.5) ) ) - 1.0;\n\treturn output2;\n}\n \nfloat field(in vec3 p) {\t\n\tfloat strength = 7. + .03 * log(1.e-6 + fract(sin(iTime) * 4373.11));\n\tfloat accum = 0.;\n\tfloat prev = 0.;\n\tfloat tw = 0.;\t\n\n\tfor (int i = 0; i < 6; ++i) {\n\t\tfloat mag = dot(p, p);\n\t\tp = abs(p) / mag + vec3(-.5, -.8 + 0.1*sin(iTime*0.7 + 2.0), -1.1+0.3*cos(iTime*0.3));\n\t\tfloat w = exp(-float(i) / 7.);\n\t\taccum += w * exp(-strength * pow(abs(mag - prev), 2.3));\n\t\ttw += w;\n\t\tprev = mag;\n\t}\n\treturn max(0., 5. * accum / tw - .7);\n}\n\n\n\nvoid main() {   \n     \tvec2 uv2 = 2. * gl_FragCoord.xy / vec2(512) - 1.;\n\tvec2 uvs = uv2 * vec2(512)  / 512.;\n\t\n\tfloat time2 = iTime;               \n        float speed = speed2;\n        speed = .01 * cos(time2*0.002 + 3.1415926/4.0);          \n\t//speed = 0.0;\t\n    \tfloat formuparam = formuparam2;\n\t\n    \t//get coords and direction\t\n\tvec2 uv = uvs;\t\t       \n\t//mouse rotation\n\tfloat a_xz = 0.9;\n\tfloat a_yz = -.6;\n\tfloat a_xy = 0.9 + iTime*0.08;\t\n\t\n\tmat2 rot_xz = mat2(cos(a_xz),sin(a_xz),-sin(a_xz),cos(a_xz));\t\n\tmat2 rot_yz = mat2(cos(a_yz),sin(a_yz),-sin(a_yz),cos(a_yz));\t\t\n\tmat2 rot_xy = mat2(cos(a_xy),sin(a_xy),-sin(a_xy),cos(a_xy));\n\t\n\n\tfloat v2 =1.0;\t\n\tvec3 dir=vec3(uv*zoom,1.); \n\tvec3 from=vec3(0.0, 0.0,0.0);                               \n        from.x -= 1.;\n        from.y -= 1.;\n               \n               \n\tvec3 forward = vec3(0.,0.,1.);   \n\tfrom.x += transverseSpeed*(1.0)*cos(0.001*iTime);\n\tfrom.y += transverseSpeed*(1.0)*sin(0.001*iTime);\n\tfrom.z += 0.003*iTime;\t\n\t\n\tdir.xy*=rot_xy;\n\tforward.xy *= rot_xy;\n\tdir.xz*=rot_xz;\n\tforward.xz *= rot_xz;\t\n\tdir.yz*= rot_yz;\n\tforward.yz *= rot_yz;\n\t\n\tfrom.xy*=-rot_xy;\n\tfrom.xz*=rot_xz;\n\tfrom.yz*= rot_yz;\n\t \n\t\n\t//zoom\n\tfloat zooom = (iTime-3311.)*speed;\n\tfrom += forward* zooom;\n\tfloat sampleShift = mod( zooom, stepsize );\n\t \n\tfloat zoffset = -sampleShift;\n\tsampleShift /= stepsize; // make from 0 to 1\n\t\n\t//volumetric rendering\n\tfloat s=0.24;\n\tfloat s3 = s + stepsize/2.0;\n\tvec3 v=vec3(0.);\n\tfloat t3 = 0.0;\t\n\t\n\tvec3 backCol2 = vec3(0.);\n\tfor (int r=0; r<volsteps; r++) {\n\t\tvec3 p2=from+(s+zoffset)*dir;// + vec3(0.,0.,zoffset);\n\t\tvec3 p3=from+(s3+zoffset)*dir;// + vec3(0.,0.,zoffset);\n\t\t\n\t\tp2 = abs(vec3(tile)-mod(p2,vec3(tile*2.))); // tiling fold\n\t\tp3 = abs(vec3(tile)-mod(p3,vec3(tile*2.))); // tiling fold\t\t\n\t\t#ifdef cloud\n\t\tt3 = field(p3);\n\t\t#endif\n\t\t\n\t\tfloat pa,a=pa=0.;\n\t\tfor (int i=0; i<iterations; i++) {\n\t\t\tp2=abs(p2)/dot(p2,p2)-formuparam; // the magic formula\n\t\t\t//p=abs(p)/max(dot(p,p),0.005)-formuparam; // another interesting way to reduce noise\n\t\t\tfloat D = abs(length(p2)-pa); // absolute sum of average change\n\t\t\ta += i > 7 ? min( 12., D) : D;\n\t\t\tpa=length(p2);\n\t\t}\n\t\t\n\t\t\n\t\t//float dm=max(0.,darkmatter-a*a*.001); //dark matter\n\t\ta*=a*a; // add contrast\n\t\t//if (r>3) fade*=1.-dm; // dark matter, don't render near\n\t\t// brightens stuff up a bit\n\t\tfloat s1 = s+zoffset;\n\t\t// need closed form expression for this, now that we shift samples\n\t\tfloat fade = pow(distfading,max(0.,float(r)-sampleShift));\t\t\n\t\t//t3 += fade;\t\t\n\t\tv+=fade;\n\t       \t//backCol2 -= fade;\n\n\t\t// fade out samples as they approach the camera\n\t\tif( r == 0 )\n\t\t\tfade *= (1. - (sampleShift));\n\t\t// fade in samples as they approach from the distance\n\t\tif( r == volsteps-1 )\n\t\t\tfade *= sampleShift;\n\t\tv+=vec3(s1,s1*s1,s1*s1*s1*s1)*a*brightness*fade; // coloring based on distance\n\t\t\n\t\tbackCol2 += mix(.4, 1., v2) * vec3(1.8 * t3 * t3 * t3, 1.4 * t3 * t3, t3) * fade;\n\n\t\t\n\t\ts+=stepsize;\n\t\ts3 += stepsize;\t\t\n\t}//\u0444\u043e\u0440\n\t\t       \n\tv=mix(vec3(length(v)),v,saturation); //color adjust\t\n\n\tvec4 forCol2 = vec4(v*.01,1.);\t\n\t#ifdef cloud\n\tbackCol2 *= cloud;\n\t#endif\t\n\tbackCol2.b *= 1.8;\n\tbackCol2.r *= 0.05;\t\n\t\n\tbackCol2.b = 0.5*mix(backCol2.g, backCol2.b, 0.8);\n\tbackCol2.g = 0.0;\n\tbackCol2.bg = mix(backCol2.gb, backCol2.bg, 0.5*(cos(iTime*0.01) + 1.0));\t\n\tgl_FragColor = forCol2 + vec4(backCol2, 1.0);\n}\n\n");function l(){return o.a.createElement("div",{className:"App"},o.a.createElement(s.a,{fs:m}))}var d=document.getElementById("root");r.a.render(o.a.createElement(l,null),d)}},[[4,2,1]]]);
//# sourceMappingURL=main.4869e293.chunk.js.map