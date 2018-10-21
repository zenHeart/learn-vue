import modal from './modal.vue';
import Vue from 'vue';

const Modal = Vue.extend(modal);
var instance;

var modalSingleton = function() {
    instance = new Modal();

    instance.vm = instance.$mount();
  
    document.body.appendChild(instance.vm.$el);
    return instance.vm;;
}

Modal.prototype.show = function() {
    console.log(modal);
    console.log(Modal);
   this.showFlag = true
}

Modal.prototype.hide = function() {
    this.showFlag = false
 }
 
 Vue.prototype.$modal =  modalSingleton();

