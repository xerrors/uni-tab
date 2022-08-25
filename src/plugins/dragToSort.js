export function dragToSort(refList, refDrop = null, dropCallback = null) {
    let dragElement;
    let lock = true;

    for( let refItem in refList) {
        refItem.addEventListener('dragstart',function(ev){
            dragElement = this;                                     // 用于存放拖动元素
            this.style.backgroundColor = '#f8f8f8';                 // 设置拖动元素的背景
        },false);

        refItem.addEventListener('dragend',function(ev){
            ev.target.style.backgroundColor = '#fff';               // 拖放结束还原拖动元素的背景
            ev.preventDefault();
        },false)

        refItem.addEventListener('dragenter', function(ev){
            if(dragElement != this){
                this.parentNode.insertBefore(dragElement,this);     // 把拖动元素添加到当前元素的前面
            }
        }, false)

        refItem.addEventListener('dragleave', function(ev){
            console.log(111);
            if(dragElement != this){
                if(lock && (this == this.parentNode.lastElementChild || this == this.parentNode.lastChild)){    // 当前元素时最后一个元素
                    this.parentNode.appendChild(dragElement);       // 把拖动元素添加最后面
                    lock = false;
                }else{
                    lock = true;
                }
            }
        }, false)
    }

    if (refDrop && dropCallback) {
        refDrop.addEventListener('drop', function(ev){                  // 拖进回收站则删除该元素
            const dropCallbackValue = dropCallback(dragElement)
            if (dropCallbackValue) {
                dragElement.parentNode.removeChild(dragElement);
            }
            else {
                console.log("取消")
            }
        }, false)
    }
    
    document.ondragover = function(e){e.preventDefault();}          // 必须设置dragover阻止默认事件
    document.ondrop = function(e){e.preventDefault();}
}