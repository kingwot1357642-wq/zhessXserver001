// Unit registry. Every file in data/units/ calls ZX.unit(id, definition); core.js builds R from it.
const ZX={units:{},
  unit(id,def){this.units[id]=def},
  buildR(){return Object.fromEntries(Object.entries(this.units)
    .sort((a,b)=>(a[1].order??1e9)-(b[1].order??1e9))
    .map(([k,u])=>{const {order,...rest}=u;return [k,rest]}))}};
                                    
