# Frappe

WIP - Secret project.

I've been toying with this for a while. The latest iteration is not too far but still not usable. 

## TODO
define application as arrows
use combinators to build logic

generation
- generate first output in html or js
- generate bind events generated by nodes
- generate bind external events (timer, custom js code, eg: http, websocket)

add array/object arrow and use them to accept inputs for h 
now it's an arrowapply and a monad - and you lose static analysis but it's the only way to have a dynamic number of children


I need:
 - dynamic collections support
 - arrows with side effects
 - events handling

Events handling:
- setAttribute('click')('onClickCTA')
- You set a label in your click, 
- The rendering system bind the event to the dom node
- ["onClickCTA", event] get added to the input to the application 
