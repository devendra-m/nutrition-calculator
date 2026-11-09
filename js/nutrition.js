window.promiseCache = null;
window.lastKeyTime = 0;
const Tooltip=(function(){
	return {			
			delay(x, y, l){				
				const step = 10;
				if(((l - step) <= y ) && ( y <= l)){
					setTimeout(Tooltip.hide,2000);	
					return false;
				}
				
				if(y > l)
					y = y - step;
				else
					y = y + step;
					
				window.scrollTo(x, y);
				setTimeout(Tooltip.delay, 10, x, y, l)
			},
				
		    show(elem){
				
					const text = Main.newElem('span',{'class':'tooltip'});
					const intext = Main.newElem('span',{'class':'intext'});
					
					const color = elem.style.border;
					elem.style.border = '1px solid #ffa500';
										
					text.style.position = 'absolute';
					text.style.background = '#fff';
					text.style.border = '1px solid';
					text.style.width = 'auto';
					text.style.height = 'auto';
					text.style.padding = '5px';	
					text.style.borderRadius = '5px';	
					
					intext.style.position = 'relative';
					intext.style.zIndex = '100';
								
					intext.innerHTML = 'This is required field.';					
								
					const left = elem.offsetParent.offsetLeft + elem.offsetLeft;
					const top = elem.offsetParent.offsetTop + elem.offsetTop - elem.offsetHeight - 30 ;
										
					text.style.left = left + 'px';
					text.style.top = top + 'px';	
										
					const y = window.scrollY;					
					
					Tooltip.delay(0,y,top);									
					
					Main.subElem(document.body,[{'e':text}]);		
					Main.subElem(text,[{'e':intext}]);												
			},		
			
			hide(){
				const text = Main.query(document,'.tooltip')
				text.remove();				
			}
	}	
})();
const Foodname = (function(){
	const foodUrl = '/data/Food_Name.json';
	return {
		async load(){
			
			const response = await fetch(foodUrl);

			if(response.ok){
				const foodName = await response.json();
				window.promiseCache = foodName;
				
				var add = Main.query(document,'.food .add');
				var calculate = Main.query(document,'.food .calculate');
				
				var deleteRecord = Main.query(document,'.food .delete');
				
				calculate.addEventListener('click', (e) => this.submit(e));
				
				add.addEventListener('click', (event) => {
					
					const rows = Main.queryAll(document,'.food li.row');
					const row = Main.query(document,'.food ul.template');
					
					const lastRow = rows[rows.length - 2];
	
					const li = Main.newElem('li',{'class':'row'});	
					const ul = Main.newElem('ul');	
					
					ul.innerHTML = row.innerHTML;
					
					Main.subElem(li,[{'e':ul}]);
												
					lastRow.after(li);
					
					Foodname.loadNames();
				});				

				this.loadNames();																														
			}					
		},
		loadName(event,foodName){
			var items = Main.query(document,'.food .items');
						
			if(items)
				items.remove();
			
			const ul = Main.newElem('ul',{'class':'items'});
			ul.style.position = 'absolute';
			ul.left = event.target.offsetLeft;
			ul.top = event.target.offsetTop + event.target.height;
			
			for(const item of Object.values(foodName)){
				
				const regex = new RegExp(".*"+event.target.value, "i");
				
				if(event.target.value.length > 0 && item.Food_Description_EN.match(regex)){
					
					const li = Main.newElem('li',{'class':'item'});	
					const labelName = Main.newElem('span',{'class':'label'});
					labelName.id = item.Food_Code;
					labelName.innerHTML = item.Food_Description_EN;
					
					labelName.addEventListener('click',(e) => Foodname.nameSelected(e.target,event.target,ul));
									
					Main.subElem(ul,[{'e':li,'>':[{'e':labelName}]}]);		
				}
			}
			
			const nameList = Main.query(ul,'li');
			
			if(nameList)		
				Main.subElem(event.target.parentElement,[{'e':ul}]);
		},
		loadNames(){
			const names = Main.queryAll(document,'.food .name');
			
			const foodName = window.promiseCache;
			
			for(const name of names){
				name.addEventListener('input', (event) => {
					  if (event.defaultPrevented) {
							return;
					  }
					  					 
					  
					  event.target.setAttribute('autocomplete','off');
					  
					  const foodId = Main.query(event.target.closest('li'),'.food_id');
					  foodId.value = '';										
					  					  
					  if(window.nameTimeout)
						clearTimeout(window.nameTimeout);					  
					  
					  window.nameTimeout = setTimeout(Foodname.loadName, 300,event,foodName);					 					  															
					});	
					
				name.addEventListener('keydown',(event) => {
					Foodname.keyDown(event);
				});
				
				}
		},
		keyDown(event){
				    const popup = Main.query(document,'.food ul.items');	

				    const list = Main.queryAll(document,'.food ul.items li');
				    
				    if(list.length < 1)
						return false;
				   
					if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13)
						event.preventDefault();						
					
						
					const selectedLi = Main.query(document,'.food ul.items li.selected');
					if(event.keyCode == 38){
						if(selectedLi){
							const li = selectedLi.previousElementSibling;	
							
							if(li){							
								li.classList.add('selected');
								selectedLi.classList.remove('selected');
							}
							
							const initialHeight = popup.scrollTop - selectedLi.offsetHeight;
							
							const total = 0;
							const adjTotal = Foodname.adjacentWidth(total,selectedLi,'up');		
							const offsetTop = adjTotal - popup.scrollTop;
							
							if(0 < initialHeight && 0 > offsetTop)//popup.offsetHeight < adjTotal)			
								popup.scroll(0,popup.scrollTop - selectedLi.offsetHeight);
						}
						else{
							const li = Main.query(document,'.food ul.items li');	
							li.classList.add('selected');		
						}
					}
					if(event.keyCode == 40){
						
						if(selectedLi){
							const li = selectedLi.nextElementSibling;	
													
							if(li){
								li.classList.add('selected');
								selectedLi.classList.remove('selected');
							}							
							
							const scrollHeight = popup.scrollTop + selectedLi.offsetHeight;		
							
							const total = 0;
							
							const adjTotal = Foodname.adjacentWidth(total,selectedLi,'down');	
							const offsetTop = adjTotal - (popup.scrollHeight - popup.scrollTop - popup.offsetHeight);							
												
							
							if(popup.scrollHeight > scrollHeight && 0 > offsetTop)//popup.offsetHeight - selectedLi.offsetHeight < adjTotal)			
								popup.scroll(0,popup.scrollTop + selectedLi.offsetHeight);
						}
						else{
							const li = Main.query(document,'.food ul.items li');						
							
							li.classList.add('selected');
						}
					}
					
					if(event.keyCode == '13' && selectedLi){
						const rowLi = selectedLi.closest('li.row');
						const name = Main.query(rowLi,'.name');
						const names = Main.query(rowLi,'.items');
						const label = Main.query(rowLi,'li.selected .label');
						Foodname.nameSelected(label,name,names);
					}
					else if(event.keyCode == '13'){						
						Foodname.submit();
					}
		},
		adjacentWidth(total, elem, type){
			
			if(type == 'down'){			
				if(elem.nextElementSibling){
					total += elem.nextElementSibling.offsetHeight;
					return Foodname.adjacentWidth(total,elem.nextElementSibling,type);								
				}
			}
			else if(type == 'up'){
				if(elem.previousElementSibling){
					total += elem.previousElementSibling.offsetHeight;
					return Foodname.adjacentWidth(total,elem.previousElementSibling,type);								
				}
			}
			
			return total - elem.offsetHeight;
			
			
		},
		nameSelected(elem, name, names){
			const foodId = Main.query(name.closest('li.row'),'[name="id[]"]');
			
			name.value = elem.innerHTML;
			foodId.value = elem.id;		
			
			names.remove();	
		},
		deleteRow(elem){
			const row = elem.closest('li.row');
			row.remove();
		},
		back(content,main){
			content.style.display = 'block';
			const nutritionMain = Main.query(document,'.'+main);
			nutritionMain.remove();
		},		
		validate(foodIds){
			const inputs = Main.queryAll(document,'.content form .name,.content form .weightGram');
			
			for(const id of foodIds){				
				const input = Main.query(id.closest('li'),'.name');
				if(input.closest('ul').className != 'template'){									
					if(id.value.length < 1)
						input.value = '';
				}
			}	
			
			for(const input of inputs){
				if(input.closest('ul').className != 'template'){
					if(input.value.length < 1){
						Tooltip.show(input);
						return false;
					}
				}
			}
			
			return true;
		},
		async submit(e){		
			
			var foodIds = Main.queryAll(document,'.food_id');		
			
			if(!this.validate(foodIds))
				return false;
										
			Loader.load(1);			
			
			const jsonparts = {};
			const range = 200;
			
			try {			
								
			const content = Main.query(document,'.content');
			const foodMain = Main.query(document,'.food_main');
						
			const response = await fetch('/data/Nutrient_Name.json');
			const response1 = await fetch('/data/Nutrient_Amount.json');					
						
			if(response.ok && response1.ok){
				const nutritionName = await response.json();
				const nutritionAmount = await response1.json();				
				
				for(const item of Object.values(nutritionAmount)){
					const part = (Math.floor(item.FC / range)) + 1;
					const partName = 'nutrient_amount_'+part;
					if(!jsonparts[partName])
						jsonparts[partName]= [];
						
					jsonparts[partName].push(item);
				}
	
				let nutritionAmounts = [];			

				for(const foodId of foodIds){	

					const weightGram = Main.query(foodId.closest('li.row'),'.weightGram');
					
					const foodWeight = parseInt(weightGram.value);
					
					const part = (Math.floor(parseInt(foodId.value) / range)) + 1;
					const partName = 'nutrient_amount_'+part;
										
					let partFood = [];
										
					if(jsonparts[partName])
						partFood = jsonparts[partName];										
					
					for(const item of partFood){		
															
						if(item.FC === parseInt(foodId.value)){
							
							const foodNutritionAmount = item.NA * foodWeight / 100; 
							
							let found = false;
							for(const nutrition of nutritionAmounts){
								if(nutrition.nutrition_code === item.NC){
									nutrition.nutrition_amount += foodNutritionAmount;
									found = true;
									break;
								}
							}							

							if(!found)
								nutritionAmounts.push({'nutrition_code':item.NC,'nutrition_amount':foodNutritionAmount});

						}
					}					
				}							
				
				const main = Main.newElem('div',{'class':'nutrition_main'});
				const link = Main.newElem('div',{'class':'link'});
				const div = Main.newElem('div',{'class':'nutrients'});
				
				let span = Main.newElem('span',{'class':'back'});
				span.innerHTML = 'Back';
				
				span.addEventListener('click',(e) => Foodname.back(foodMain,'nutrition_main'));
				
				Main.subElem(link,[{'e':span}]);								
				
				const table = Main.newElem('table',{'class':'table'});
				let tr = Main.newElem('thead');
				let td = Main.newElem('td',{'class':'column-1'});
																				
				span = Main.newElem('span',{'class':'name'});
				span.innerHTML = 'Nutrient';
				
				Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
				
				td = Main.newElem('td',{'class':'column-2'});
				span = Main.newElem('span',{'class':'amount'});
				span.innerHTML = 'Nutrient Amount';												
				
				Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);
				Main.subElem(div,[{'e':table}]);					
				
				foodMain.style.display = 'none';
				
				Main.subElem(main,[{'e':link}]);		
				Main.subElem(main,[{'e':div}]);		
				
				Main.subElem(content,[{'e':main}]);
				
				for(const item of Object.values(nutritionName)){		
				
					let nutritionAmountRow = 0;
					for(const nutritionAmount of nutritionAmounts){
						if(nutritionAmount.nutrition_code === item.Nutrient_Code){
							
							nutritionAmountRow = nutritionAmount.nutrition_amount;
							break;
						}
					}
					
					tr = Main.newElem('tr');
					td = Main.newElem('td',{'class':'column-1'});
					span = Main.newElem('span',{'class':'name'});
					span.innerHTML = item.Nutrient_Name_EN;
					
					Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
					
					td = Main.newElem('td',{'class':'column-2'});
					span = Main.newElem('span',{'class':'amount'});
					span.innerHTML = (Math.round(nutritionAmountRow * 100) / 100) + ' '+ item.Nutrient_Unit;
					
					Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
				}
				
			}
				} catch (error) {
				console.error(error.message);
			  }
			  finally{
				Loader.clearLoader();
			  }				
		}
	}
})();

const Loader = (function(){

	return {
		load(n){		

			const loaderDiv = Main.query(document,'.loader');
			loaderDiv.style.display = 'block';	
			
			var height = loaderDiv.offsetHeight;
			
			var top = window.scrollY + Math.floor((window.innerHeight - height) / 2);			
			
			loaderDiv.style.top = top + 'px';			
			
		},
		clearLoader(){
			const loader = Main.query(document,'.loader');
			loader.style.display = 'none';			
		}
	}
})();
