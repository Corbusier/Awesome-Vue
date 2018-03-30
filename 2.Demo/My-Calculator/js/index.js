var Calculator = new Vue({
	el:"#calculator",
	data:{
		inputShow:{
			value:"0",
			name:""
		},
		string:[],
		type:""
	},
	components:{
		"input-box":{
			props:["inputShow"],
			computed:{
				value:function(){
					return this.inputShow.value;
				}
			},
			template:"<input id='input-box' type='text' maxlength='21' v-model='value' readonly='readonly'>"
		},
		"btn-group":{
			template:"<div id='btn-list'><slot></slot></div>"
		}
	},
	methods:{
		result:function(value){
			var result = new Array;
            result.push((value[value.length-2]));
            result.push((value[value.length-1]));
            return (result);
		},
		numbertoinput:function(num){
			input = this.inputShow;
			if(input.name == "type"){	
				input.value = " ";
				input.name = " ";		
			}
			if(num != "." && input.value[0] == 0 && input.value[1] !== "."){
				input.value = num;
			}else if(num == "." && input.value.indexOf(".") !== -1){
				input.value = input.value;
			}else if(input.value == "Infinity" || input.value == "NaN"){
				input.value = "";
				input.value += num;
			}else{
				input.value += num;
			}
		},
		operator:function(type){
			switch(type){
				case "clear":
					this.inputShow.value = "0";
					this.string.length = 0;
					break;
				case "backspace":
					if(this.checknum(this.inputShow.value) !== 0){
						this.inputShow.value = this.inputShow.value.replace(/.$/,'');
						if(this.inputShow.value === ""){
							this.inputShow.value = "0";
						}
					}
					break;
				case "opposite":
					if(this.checknum(this.inputShow.value) !== 0){
						this.inputShow.value = - this.inputShow.value;
					}
					break;
				case "percent":
					if(this.checknum(this.inputShow.value) !== 0){
						this.inputShow.value = this.inputShow.value/100;
					}
					break;
				case "pow":
					if(this.checknum(this.inputShow.value) !== 0){
						this.inputShow.value = Math.pow(this.inputShow.value,2);
					}
					break;
				case "sqrt":
					if(this.checknum(this.inputShow.value) !== 0){
						this.inputShow.value = Math.sqrt(this.inputShow.value);
					}
					break;
				case "plus":
					if(this.checknum(this.inputShow.value) !== 0){
						this.string.push(this.inputShow.value);
						this.type = "plus";
						this.inputShow.value = "+";
						this.inputShow.name = "type";
					}
					break;
				case "minus":
					if(this.checknum(this.inputShow.value) !== 0){
						this.string.push(this.inputShow.value);
						this.type = "minus";
						this.inputShow.value = "-";
						this.inputShow.name = "type";
					}
					break;
				case "multiply":
					if(this.checknum(this.inputShow.value) !== 0){
						this.string.push(this.inputShow.value);
						this.type = "multiply";
						this.inputShow.value = "×";
						this.inputShow.name = "type";
					}
					break;
				case "divide":
					if(this.checknum(this.inputShow.value) !== 0){
						this.string.push(this.inputShow.value);
						this.type = "divide";
						this.inputShow.value = "/";
						this.inputShow.name = "type";
					}
					break;
				case "result":
					if(this.checknum(this.inputShow.value) !== 0){
						this.string.push(this.inputShow.value);
						if(parseInt(this.string.length)%2 !== 0){
                            this.string.push(this.string[this.string.length-2]);
                        }
                        if(this.type == "plus"){
                            this.inputShow.value = (( this.result(this.string)[1] )*this.Exponentiation() + ( this.result(this.string)[0] )*this.Exponentiation() ) /this.Exponentiation();
                            this.inputShow.name = "type";
                        }else if(this.type == "minus"){
                            this.inputShow.value = (( this.result(this.string)[0] )*this.Exponentiation() - ( this.result(this.string)[1] )*this.Exponentiation() ) /this.Exponentiation();
                            this.inputShow.name = "type";
                        }
                        else if(this.type == "multiply"){
                            this.inputShow.value = (( this.result(this.string)[1] )*this.Exponentiation() * ( this.result(this.string)[0] )*this.Exponentiation() )/Math.pow(this.Exponentiation(),2);
                            this.inputShow.name = "type";
                        }else if(this.type == "divide"){
                            this.inputShow.value = (( this.result(this.string)[0] )*this.Exponentiation()) / (( this.result(this.string)[1] )*this.Exponentiation() );
                            this.inputShow.name = "type";
                        }
                        break;
					}
			}
		},
		checknum:function(inputvalue){
			if(inputvalue == "+" || inputvalue == "-" || inputvalue == "×" || inputvalue == "/" || inputvalue == "0"){
				return 0;
			}
		},
		Exponentiation:function(){
			var n1 = (this.result(this.string)[0]).toString().split(".").length;
	        var n2 = (this.result(this.string)[1]).toString().split(".").length;
	        var n = Math.pow(10,Math.max(n1,n2));
	        return n;
		}
	}
});