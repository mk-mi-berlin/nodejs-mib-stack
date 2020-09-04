docker inspect $1 | grep 'LogPath' | sed -n "s/^.*\(\/var.*\)\",$/\1/p" | xargs sudo less
