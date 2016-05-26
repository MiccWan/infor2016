var chk = function(x,y,z){
    var jizz=1;
    var res=[];
    for(var i=0;i<4;i++,jizz*=2){
        var point = [chk[x][y][i],chk[x][i][z],chk[i][y][z],chk[x][i][i],chk[x][i][3-i],chk[i][y][i],chk[i][y][3-i],chk[i][i][z],chk[i][3-i][z],chk[i][i][i],chk[i][i][3-i],chk[3-i][i][i],chk[3-i][i][3-i]];
        for(var line=0;line<chk.length;line++){
            if(chk[line]==1){
                res[line]+=jizz;
            }
            if(chk[line]==2){
                res[line]-=jizz;
            }
        }
    }
    
    var win1=false;win2=false;
    for(var i=0;i<res.length;i++){
        if(res[i]==15){
            return 1;
        }
        if(res[i]==-15){
            return 2;
        }
    }
    return 0;
}
