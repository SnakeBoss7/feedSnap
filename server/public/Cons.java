class stud
{
    String name;
    int age;
    stud()
    {
        System.out.println("default cons");
    }
    stud(String n,int a)
    {
        System.out.println("para cons");
        this.name = n;
        this.age=a;
    }
    stud(stud O)
    {
        System.out.println("copy cons");
        this.name = O.name;
        this.age=O.age;
    }
    void display()
    {
                System.out.println("My name is :"+this.name);
                System.out.println("My age is :"+this.age);
    }
}
public class Cons 
{
    public static void main(String[] args)
    {
        stud s1 = new stud("rahul",20);
        s1.display();
        stud s2 = new stud();
        s2.display();
        stud s3 = new stud(s1);
        s3.display();
    }
}